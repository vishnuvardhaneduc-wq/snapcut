import { apiClient } from './api';
import { processBackgroundRemoval } from '../lib/backgroundRemover';
import type { UploadItem } from '../types';

export interface ImageProcessingOptions {
  feathering?: number;
  edgeSmoothing?: number;
  contrast?: number;
}

export const imageService = {
  // Process image background removal
  async removeBackground(file: File, _options?: ImageProcessingOptions): Promise<{
    processedUrl: string;
    originalUrl: string;
    record: Partial<UploadItem>;
  }> {
    const originalUrl = URL.createObjectURL(file);

    try {
      const result = await processBackgroundRemoval({ file, imageUrl: originalUrl });

      const record: Partial<UploadItem> = {
        id: `upl_${Date.now()}`,
        user_id: 'usr_current',
        original_filename: file.name,
        file_size_bytes: file.size,
        status: 'completed',
        original_url: originalUrl,
        processed_url: result.processedUrl,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      return {
        processedUrl: result.processedUrl,
        originalUrl,
        record,
      };
    } catch {
      return {
        processedUrl: originalUrl,
        originalUrl,
        record: {
          id: `upl_${Date.now()}`,
          original_filename: file.name,
          file_size_bytes: file.size,
          status: 'failed',
        },
      };
    }
  },

  // Get user's recent upload history
  async getUploadHistory(): Promise<UploadItem[]> {
    try {
      const response = await apiClient.get<UploadItem[]>('/images/history');
      return response.data;
    } catch {
      return [];
    }
  },

  // Delete an upload record
  async deleteUpload(id: string): Promise<void> {
    try {
      await apiClient.delete(`/images/${id}`);
    } catch {
      // ignore
    }
  },
};
