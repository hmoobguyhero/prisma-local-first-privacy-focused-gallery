import { create } from 'zustand';
import { getDirectoryHandle, verifyPermission, scanFiles, processFile } from '@/lib/fs-helpers';
import type { PhotoMetadata } from '@shared/types';
export type GalleryStatus = 'idle' | 'loading' | 'permission-denied' | 'scanning' | 'processing' | 'ready' | 'error';
interface GalleryState {
  directoryHandle: FileSystemDirectoryHandle | null;
  directoryName: string | null;
  photos: PhotoMetadata[];
  status: GalleryStatus;
  error: string | null;
  scanStats: {
    found: number;
    processed: number;
  };
}
interface GalleryActions {
  loadDirectory: (fromCache?: boolean) => Promise<void>;
  setDirectoryHandle: (handle: FileSystemDirectoryHandle | null) => void;
  clearGallery: () => void;
}
export const useGalleryStore = create<GalleryState & GalleryActions>((set, get) => ({
  directoryHandle: null,
  directoryName: null,
  photos: [],
  status: 'idle',
  error: null,
  scanStats: { found: 0, processed: 0 },
  setDirectoryHandle: (handle) => {
    set({ directoryHandle: handle, directoryName: handle?.name ?? null });
  },
  clearGallery: () => {
    get().photos.forEach(photo => URL.revokeObjectURL(photo.src));
    set({
      photos: [],
      status: 'idle',
      error: null,
      scanStats: { found: 0, processed: 0 },
    });
  },
  loadDirectory: async (fromCache = true) => {
    get().clearGallery();
    set({ status: 'loading', error: null });
    const handle = await getDirectoryHandle(fromCache);
    if (!handle) {
      set({ status: 'idle', error: fromCache ? null : 'Directory selection was cancelled.' });
      return;
    }
    const hasPermission = await verifyPermission(handle);
    if (!hasPermission) {
      set({ status: 'permission-denied', error: 'Permission to access the directory was denied.' });
      return;
    }
    get().setDirectoryHandle(handle);
    set({ status: 'scanning' });
    try {
      const fileHandles: FileSystemFileHandle[] = [];
      for await (const fileHandle of scanFiles(handle)) {
        fileHandles.push(fileHandle);
        set(state => ({ scanStats: { ...state.scanStats, found: fileHandles.length } }));
      }
      set({ status: 'processing' });
      const newPhotos: PhotoMetadata[] = [];
      for (let i = 0; i < fileHandles.length; i++) {
        const photoData = await processFile(fileHandles[i]);
        if (photoData) {
          newPhotos.push(photoData);
        }
        set(state => ({
          photos: newPhotos,
          scanStats: { ...state.scanStats, processed: i + 1 }
        }));
      }
      set({ status: 'ready' });
    } catch (err) {
      console.error('Error loading directory:', err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      set({ status: 'error', error: message });
    }
  },
}));