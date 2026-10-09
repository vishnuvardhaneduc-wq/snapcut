import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatTimeRemaining(expiryDateString: string): string {
  const diff = new Date(expiryDateString).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
}

export type ImageFormat = 'png' | 'jpeg' | 'webp';

export interface QualityOption {
  id: string;
  label: string;
  format: ImageFormat;
  quality?: number;
  subtitle: string;
  badge?: string;
  recommended?: boolean;
}

export const DOWNLOAD_QUALITY_OPTIONS: QualityOption[] = [
  {
    id: 'png-original',
    label: 'Original PNG',
    format: 'png',
    subtitle: 'Lossless, transparent background',
    badge: 'Best',
    recommended: true,
  },
  {
    id: 'webp-high',
    label: 'High Quality WebP',
    format: 'webp',
    quality: 0.92,
    subtitle: 'Smaller size, preserves transparency',
    badge: 'Recommended',
  },
  {
    id: 'webp-medium',
    label: 'Medium WebP',
    format: 'webp',
    quality: 0.7,
    subtitle: 'Balanced size and quality',
  },
  {
    id: 'jpeg-max',
    label: 'Max JPEG (White BG)',
    format: 'jpeg',
    quality: 0.95,
    subtitle: 'Maximum JPEG, solid white backdrop',
    badge: 'Print Ready',
  },
  {
    id: 'jpeg-medium',
    label: 'Good JPEG (White BG)',
    format: 'jpeg',
    quality: 0.75,
    subtitle: 'Smaller file, ecommerce optimized',
  },
  {
    id: 'jpeg-email',
    label: 'Email/Small JPEG',
    format: 'jpeg',
    quality: 0.45,
    subtitle: 'Fastest upload & smallest file',
  },
];

async function loadImageIntoCanvas(src: string): Promise<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; width: number; height: number }> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image for encoding'));
    img.src = src;
  });

  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, ctx, width, height };
}

export async function encodeImageBlob(
  src: string,
  format: ImageFormat,
  quality?: number,
): Promise<Blob> {
  const { canvas, width, height } = await loadImageIntoCanvas(src);
  let targetCanvas = canvas;

  if (format === 'jpeg') {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = width;
    newCanvas.height = height;
    const newCtx = newCanvas.getContext('2d', { willReadFrequently: true });
    if (!newCtx) throw new Error('Canvas 2D context unavailable');
    newCtx.fillStyle = '#FFFFFF';
    newCtx.fillRect(0, 0, width, height);
    newCtx.drawImage(canvas, 0, 0, width, height);
    targetCanvas = newCanvas;
  }

  const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
  const blob: Blob = await new Promise((resolve, reject) => {
    targetCanvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to encode image blob'))),
      mime,
      quality,
    );
  });
  return blob;
}

export function extensionForFormat(format: ImageFormat): string {
  return format === 'jpeg' ? 'jpg' : format;
}

export async function downloadImage(url: string, filename: string) {
  const targetName = filename || 'snapcut-transparent.png';
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    const link = document.createElement('a');
    link.href = url;
    link.download = targetName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    return;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = targetName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
  } catch (err) {
    console.warn('Blob download failed, falling back to direct link:', err);
    const link = document.createElement('a');
    link.href = url;
    link.download = targetName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
