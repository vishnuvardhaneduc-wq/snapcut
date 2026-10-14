import { create } from 'zustand';
import { imageService } from '../services/imageService';
import type { UploadItem } from '../types';

export type BackdropMode =
  | 'transparent'
  | 'checkerboard-light'
  | 'white'
  | 'black'
  | 'cyberpunk-neon'
  | 'sunset'
  | 'custom';

interface WorkspaceState {
  // Current Active Job
  file: File | null;
  originalUrl: string | null;
  processedUrl: string | null;
  filename: string;
  fileSizeBytes: number;
  width: number;
  height: number;
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  stepMessage: string;
  errorMessage: string | null;
  processingTimeMs: number;

  // Visual Controls
  backdropMode: BackdropMode;
  customColor: string;
  zoomLevel: number; // 0.5 to 3.0
  sliderPosition: number; // 0 to 100

  // 24-Hour Ephemeral History
  history: UploadItem[];
  historyLoading: boolean;

  // Actions
  setFile: (file: File, objectUrl: string) => void;
  setProcessingState: (
    status: 'idle' | 'uploading' | 'processing' | 'success' | 'error',
    progress?: number,
    message?: string
  ) => void;
  setProcessedResult: (result: {
    url: string;
    timeMs: number;
    width?: number;
    height?: number;
    bytes?: number;
    cloudinaryPublicId?: string;
  }) => void;
  setError: (message: string) => void;
  setBackdropMode: (mode: BackdropMode) => void;
  setCustomColor: (color: string) => void;
  setZoomLevel: (zoom: number) => void;
  setSliderPosition: (pos: number) => void;
  loadHistory: () => Promise<void>;
  addToHistory: (item: UploadItem) => void;
  removeFromHistory: (id: string) => Promise<void>;
  resetWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  file: null,
  originalUrl: null,
  processedUrl: null,
  filename: '',
  fileSizeBytes: 0,
  width: 0,
  height: 0,
  status: 'idle',
  progress: 0,
  stepMessage: '',
  errorMessage: null,
  processingTimeMs: 0,

  backdropMode: 'transparent',
  customColor: '#00F2FE',
  zoomLevel: 1,
  sliderPosition: 50,

  history: [],
  historyLoading: false,

  setFile: (file, objectUrl) => {
    set({
      file,
      originalUrl: objectUrl,
      processedUrl: null,
      filename: file.name,
      fileSizeBytes: file.size,
      status: 'idle',
      progress: 0,
      errorMessage: null,
    });
  },

  setProcessingState: (status, progress = 0, stepMessage = '') => {
    set({ status, progress, stepMessage, errorMessage: null });
  },

  setProcessedResult: (result) => {
    const { originalUrl, filename, fileSizeBytes, history } = get();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const newItem: UploadItem = {
      id: `upl_${Date.now()}`,
      user_id: 'usr_current',
      original_filename: filename || 'cutout.png',
      file_size_bytes: result.bytes || fileSizeBytes || 1000000,
      width: result.width || 1920,
      height: result.height || 1080,
      original_url: originalUrl || result.url,
      processed_url: result.url,
      cloudinary_public_id: result.cloudinaryPublicId,
      status: 'completed',
      processing_time_ms: result.timeMs,
      source: 'web',
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    };

    set({
      processedUrl: result.url,
      status: 'success',
      progress: 100,
      stepMessage: 'Done!',
      processingTimeMs: result.timeMs,
      width: result.width || 1920,
      height: result.height || 1080,
      history: [newItem, ...history],
    });

    // Asynchronously sync record to Supabase
    imageService.saveProcessedImage({
      originalFilename: filename || 'cutout.png',
      fileSizeBytes: result.bytes || fileSizeBytes || 1000000,
      width: result.width || 1920,
      height: result.height || 1080,
      originalUrl: originalUrl || result.url,
      processedUrl: result.url,
      processingTimeMs: result.timeMs,
      cloudinaryPublicId: result.cloudinaryPublicId,
    }).then((saved) => {
      if (saved) {
        set((state) => ({
          history: state.history.map((h) => (h.id === newItem.id ? saved : h)),
        }));
      }
    });
  },

  setError: (errorMessage) => {
    set({
      status: 'error',
      errorMessage,
      progress: 0,
    });
  },

  setBackdropMode: (backdropMode) => set({ backdropMode }),
  setCustomColor: (customColor) => set({ customColor }),
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),
  setSliderPosition: (sliderPosition) => set({ sliderPosition }),

  loadHistory: async () => {
    set({ historyLoading: true });
    try {
      const items = await imageService.getUploadHistory();
      set({ history: items, historyLoading: false });
    } catch {
      set({ historyLoading: false });
    }
  },

  addToHistory: (item) => {
    set((state) => ({
      history: [item, ...state.history],
    }));
  },

  removeFromHistory: async (id) => {
    set((state) => ({
      history: state.history.filter((item) => item.id !== id),
    }));
    await imageService.deleteUpload(id);
  },

  resetWorkspace: () => {
    set({
      file: null,
      originalUrl: null,
      processedUrl: null,
      filename: '',
      fileSizeBytes: 0,
      status: 'idle',
      progress: 0,
      stepMessage: '',
      errorMessage: null,
      processingTimeMs: 0,
      sliderPosition: 50,
      zoomLevel: 1,
    });
  },
}));
