const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || '';

export interface RemovalOptions {
  file: File;
  imageUrl: string;
  uploadId?: string;
  userId?: string;
  onProgress?: (progress: number, step: string) => void;
}

export interface RemovalResult {
  processedUrl: string;
  processingTimeMs: number;
  width: number;
  height: number;
  fileSizeBytes: number;
  cloudinaryPublicId?: string;
}

export interface WebhookResponse {
  url?: string;
  processedUrl?: string;
  image_url?: string;
  public_id?: string;
  publicId?: string;
}

/**
 * Send image binary buffer to n8n AI webhook
 */
export async function sendImageToWebhook(
  file: File,
  onProgress?: (progress: number, step: string) => void
): Promise<{ url: string; public_id?: string }> {
  if (!WEBHOOK_URL) {
    throw new Error('n8n webhook URL is not configured. Set VITE_N8N_WEBHOOK_URL in environment variables.');
  }

  onProgress?.(25, 'Uploading photo to n8n AI automation...');
  const arrayBuffer = await file.arrayBuffer();

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
      'X-File-Name': encodeURIComponent(file.name),
      'X-File-Size': String(file.size),
      'X-File-Type': file.type || 'application/octet-stream',
    },
    body: arrayBuffer,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`n8n webhook error (${response.status}): ${errorText || response.statusText}`);
  }

  onProgress?.(70, 'Receiving AI cutout from Cloudinary...');

  const contentType = response.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      if (text.startsWith('http')) {
        return { url: text.trim() };
      }
      throw new Error('n8n webhook returned an invalid format');
    }
  }

  const resultUrl = data.url || data.processedUrl || data.image_url;
  if (!resultUrl) {
    throw new Error('n8n response missing "url" field');
  }

  // Extract or parse Cloudinary public_id
  let publicId = data.public_id || data.publicId || data.cloudinary_public_id;
  if (!publicId && typeof resultUrl === 'string' && resultUrl.includes('cloudinary.com')) {
    const match = resultUrl.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
    if (match && match[1]) {
      publicId = match[1];
    }
  }

  return { url: resultUrl, public_id: publicId };
}

async function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    };
    img.onerror = () => resolve({ width: 1920, height: 1080 });
    img.src = src;
  });
}

async function estimateUrlBytes(url: string): Promise<number> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    const cl = res.headers.get('content-length');
    if (cl) return parseInt(cl, 10);
  } catch {
    // ignore
  }
  return 1000000;
}

/**
 * Validate image file constraints:
 * - JPG, JPEG, PNG, WEBP
 * - Max 10MB
 * - Max 5000x5000 px
 */
export async function validateImageFile(
  file: File
): Promise<{ valid: boolean; error?: string; width?: number; height?: number }> {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return { valid: false, error: 'Unsupported format. Please upload JPG, PNG, or WEBP.' };
  }

  const maxBytes = 10 * 1024 * 1024; // 10MB
  if (file.size > maxBytes) {
    return { valid: false, error: 'File size exceeds 10MB limit.' };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.naturalWidth > 5000 || img.naturalHeight > 5000) {
        resolve({
          valid: false,
          error: `Image dimensions (${img.naturalWidth}x${img.naturalHeight}) exceed 5000x5000px maximum.`,
        });
      } else {
        resolve({ valid: true, width: img.naturalWidth, height: img.naturalHeight });
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false, error: 'Failed to read image dimensions.' });
    };
    img.src = url;
  });
}

/**
 * Fallback Local Canvas Segmenter
 * Removes solid or uniform backgrounds if webhook is offline
 */
export async function removeBackgroundLocal(
  imageSource: File | string,
  onProgress?: (progress: number, step: string) => void
): Promise<RemovalResult> {
  const startTime = performance.now();
  onProgress?.(10, 'Loading image into memory buffer...');

  const img = new Image();
  img.crossOrigin = 'anonymous';

  if (typeof imageSource === 'string') {
    img.src = imageSource;
  } else {
    img.src = URL.createObjectURL(imageSource);
  }

  await new Promise((resolve, reject) => {
    img.onload = () => resolve(true);
    img.onerror = () => reject(new Error('Failed to load image buffer'));
  });

  onProgress?.(30, 'Analyzing color gradients & corner saliency...');

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(img, 0, 0, width, height);

  onProgress?.(50, 'Extracting foreground subject...');
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Sample corner pixel colors
  const corners = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [Math.floor(width / 2), 0],
  ];

  const bgSamples: number[][] = [];
  corners.forEach(([cx, cy]) => {
    const idx = (cy * width + cx) * 4;
    bgSamples.push([data[idx], data[idx + 1], data[idx + 2]]);
  });

  const threshold = 48;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let minDistance = Infinity;
    for (const [bgR, bgG, bgB] of bgSamples) {
      const dist = Math.sqrt(
        Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
      );
      if (dist < minDistance) {
        minDistance = dist;
      }
    }

    if (minDistance < threshold) {
      data[i + 3] = 0;
    } else if (minDistance < threshold + 24) {
      const alpha = (minDistance - threshold) / 24;
      data[i + 3] = Math.round(alpha * 255);
    }
  }

  onProgress?.(75, 'Applying feathered edge smoothing...');
  ctx.putImageData(imgData, 0, 0);

  onProgress?.(85, 'Rendering high-resolution transparent PNG...');
  const transparentPngUrl = canvas.toDataURL('image/png');
  const elapsed = Math.round(performance.now() - startTime);

  onProgress?.(100, 'Completed!');

  return {
    processedUrl: transparentPngUrl,
    processingTimeMs: elapsed,
    width,
    height,
    fileSizeBytes: Math.round((transparentPngUrl.length * 3) / 4),
  };
}

/**
 * Background Removal Processor
 * Primary: Sends image to n8n AI webhook automation
 * Fallback: Uses client-side segmenter if n8n is unreachable
 */
export async function processBackgroundRemoval(options: RemovalOptions): Promise<RemovalResult> {
  const { file, imageUrl, onProgress } = options;
  const startTime = performance.now();

  if (file) {
    try {
      const webhookRes = await sendImageToWebhook(file, onProgress);
      const processedUrl = webhookRes.url;

      onProgress?.(85, 'Calculating resolution dimensions...');
      const [{ width, height }, bytes] = await Promise.all([
        getImageDimensions(processedUrl),
        estimateUrlBytes(processedUrl),
      ]);

      onProgress?.(100, 'Completed!');
      return {
        processedUrl,
        processingTimeMs: Math.round(performance.now() - startTime),
        width,
        height,
        fileSizeBytes: bytes,
        cloudinaryPublicId: webhookRes.public_id,
      };
    } catch (webhookErr: any) {
      console.warn('n8n Webhook failed, falling back to local engine:', webhookErr?.message);
      onProgress?.(30, 'n8n offline, falling back to local cutout engine...');
    }
  }

  // Fallback to local segmenter
  const result = await removeBackgroundLocal(file || imageUrl, onProgress);

  return {
    ...result,
    processingTimeMs: Math.max(result.processingTimeMs, Math.round(performance.now() - startTime)),
  };
}
