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

/**
 * Downloads full-resolution transparent PNG via Blob URL
 * Preserves lossless alpha transparency and proper file naming
 */
export async function downloadImage(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Download failed');
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    const baseName = filename ? filename.replace(/\.[^/.]+$/, '') : 'snapcut-cutout';
    link.download = `${baseName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  } catch {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename || 'snapcut-cutout.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
