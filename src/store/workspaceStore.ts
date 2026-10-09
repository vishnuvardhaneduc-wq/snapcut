import { create } from 'zustand';
import type { UploadItem } from '../types';

export type BackdropMode = 'transparent' | 'checkerboard-light' | 'white' | 'black' | 'cyberpunk-neon' | 'sunset' | 'custom';

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

  // Temporary History (24h storage)
  history: UploadItem[];

  // Actions
  setFile: (file: File, objectUrl: string) => void;
  setProcessingState: (status: 'idle' | 'uploading' | 'processing' | 'success' | 'error', progress?: number, message?: string) => void;
  setProcessedResult: (result: { url: string; timeMs: number; width?: number; height?: number; bytes?: number }) => void;
  setError: (message: string) => void;
  setBackdropMode: (mode: BackdropMode) => void;
  setCustomColor: (color: string) => void;
  setZoomLevel: (zoom: number) => void;
  setSliderPosition: (pos: number) => void;
  addToHistory: (item: UploadItem) => void;
  removeFromHistory: (id: string) => void;
  resetWorkspace: () => void;
}

// Initial demo samples
const initialHistory: UploadItem[] = [
  {
    id: 'upl_demo_1',
    user_id: 'usr_demo_7829',
    original_filename: 'model-portrait-cyberpunk.jpg',
    file_size_bytes: 2450000,
    width: 2400,
    height: 3000,
    original_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80',
    processed_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80',
    status: 'completed',
    processing_time_ms: 1240,
    source: 'web',
    expires_at: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'upl_demo_2',
    user_id: 'usr_demo_7829',
    original_filename: 'sneaker-product-shot.png',
    file_size_bytes: 1850000,
    width: 2000,
    height: 2000,
    original_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80',
    processed_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80',
    status: 'completed',
    processing_time_ms: 980,
    source: 'web',
    expires_at: new Date(Date.now() + 19 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'upl_demo_3',
    user_id: 'usr_demo_7829',
    original_filename: 'smartwatch-minimal-render.webp',
    file_size_bytes: 920000,
    width: 1800,
    height: 1800,
    original_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80',
    processed_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80',
    status: 'completed',
    processing_time_ms: 850,
    source: 'api',
    expires_at: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  }
];

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

  history: initialHistory,

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
    
    const newItem: UploadItem = {
      id: `upl_${Date.now()}`,
      user_id: 'usr_current',
      original_filename: filename || 'cutout.png',
      file_size_bytes: result.bytes || fileSizeBytes || 1000000,
      width: result.width || 1920,
      height: result.height || 1080,
      original_url: originalUrl || result.url,
      processed_url: result.url,
      status: 'completed',
      processing_time_ms: result.timeMs,
      source: 'web',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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

  addToHistory: (item) => {
    set((state) => ({
      history: [item, ...state.history],
    }));
  },

  removeFromHistory: (id) => {
    set((state) => ({
      history: state.history.filter((item) => item.id !== id),
    }));
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
