import { supabase } from '../lib/supabase';
import { processBackgroundRemoval } from '../lib/backgroundRemover';
import type { UploadItem } from '../types';

export interface ImageProcessingOptions {
  feathering?: number;
  edgeSmoothing?: number;
  contrast?: number;
}

export const imageService = {
  // Process image background removal and persist record to Supabase
  async removeBackground(file: File, _options?: ImageProcessingOptions): Promise<{
    processedUrl: string;
    originalUrl: string;
    record: Partial<UploadItem>;
  }> {
    const originalUrl = URL.createObjectURL(file);

    try {
      const result = await processBackgroundRemoval({ file, imageUrl: originalUrl });

      const { data: { session } } = await supabase.auth.getSession();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      let recordId = `upl_${Date.now()}`;

      if (session?.user?.id) {
        const { data: inserted, error } = await supabase
          .from('image_history')
          .insert({
            user_id: session.user.id,
            original_filename: file.name,
            file_size_bytes: file.size,
            width: result.width,
            height: result.height,
            original_url: originalUrl,
            processed_url: result.processedUrl,
            cloudinary_public_id: result.cloudinaryPublicId || null,
            status: 'completed',
            processing_time_ms: result.processingTimeMs,
            source: 'web',
            expires_at: expiresAt,
          })
          .select()
          .maybeSingle();

        if (inserted?.id && !error) {
          recordId = inserted.id;
        }
      }

      const record: UploadItem = {
        id: recordId,
        user_id: session?.user?.id || 'usr_current',
        original_filename: file.name,
        file_size_bytes: result.fileSizeBytes || file.size,
        width: result.width,
        height: result.height,
        status: 'completed',
        original_url: originalUrl,
        processed_url: result.processedUrl,
        cloudinary_public_id: result.cloudinaryPublicId,
        processing_time_ms: result.processingTimeMs,
        source: 'web',
        created_at: new Date().toISOString(),
        expires_at: expiresAt,
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

  // Save an already processed result into Supabase
  async saveProcessedImage(item: {
    originalFilename: string;
    fileSizeBytes: number;
    width: number;
    height: number;
    originalUrl: string;
    processedUrl: string;
    processingTimeMs: number;
    cloudinaryPublicId?: string;
  }): Promise<UploadItem | null> {
    const { data: { session } } = await supabase.auth.getSession();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    if (session?.user?.id) {
      try {
        const { data: inserted } = await supabase
          .from('image_history')
          .insert({
            user_id: session.user.id,
            original_filename: item.originalFilename,
            file_size_bytes: item.fileSizeBytes,
            width: item.width,
            height: item.height,
            original_url: item.originalUrl,
            processed_url: item.processedUrl,
            cloudinary_public_id: item.cloudinaryPublicId || null,
            status: 'completed',
            processing_time_ms: item.processingTimeMs,
            source: 'web',
            expires_at: expiresAt,
          })
          .select()
          .maybeSingle();

        if (inserted) {
          return inserted as UploadItem;
        }
      } catch (err) {
        console.warn('Failed to save image record to Supabase:', err);
      }
    }

    return null;
  },

  // Get user's unexpired upload history (auto-hides expired > 24h files)
  async getUploadHistory(): Promise<UploadItem[]> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('image_history')
        .select('*')
        .gt('expires_at', now)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !data) return [];
      return data as UploadItem[];
    } catch {
      return [];
    }
  },

  // Delete an upload record from Supabase
  async deleteUpload(id: string): Promise<void> {
    try {
      await supabase.from('image_history').delete().eq('id', id);
    } catch {
      // ignore
    }
  },
};
