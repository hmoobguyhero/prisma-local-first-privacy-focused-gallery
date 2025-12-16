import { create } from 'zustand';
import { getCachedHandle, selectDirectoryHandle, verifyPermission, scanFiles, processFile } from '@/lib/fs-helpers';
import type { PhotoMetadata } from '@shared/types';
export type GalleryStatus = 'idle' | 'loading' | 'permission-denied' | 'permission-req' | 'scanning' | 'processing' | 'ready' | 'error';
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
  loadDirectory: (selectNew?: boolean) => Promise<void>;
  setDirectoryHandle: (handle: FileSystemDirectoryHandle | null) => void;
  clearGallery: () => void;
  scanDirectory: (handle: FileSystemDirectoryHandle) => Promise<void>;
  tryLoadCached: () => Promise<void>;
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
  // -------------------------------------------------------------------------
  // Scan a directory: enumerate files, process each file, update stats & UI.
  // -------------------------------------------------------------------------
  scanDirectory: async (handle: FileSystemDirectoryHandle) => {
    set({ status: 'scanning' });
    try {
      const fileHandles: FileSystemFileHandle[] = [];
      for await (const fileHandle of scanFiles(handle)) {
        fileHandles.push(fileHandle);
        // Use functional update to avoid stale closure
        set(state => ({
          scanStats: { ...state.scanStats, found: fileHandles.length },
        }));
      }

      set({ status: 'processing' });

      const newPhotos: PhotoMetadata[] = [];
      for (let i = 0; i < fileHandles.length; i++) {
        const photoData = await processFile(fileHandles[i]);
        if (photoData) {
          newPhotos.push(photoData);
        }
        // Functional update for photos & processed count
        set(state => ({
          photos: newPhotos,
          scanStats: { ...state.scanStats, processed: i + 1 },
        }));
      }

      set({ status: 'ready' });
    } catch (err) {
      console.error('Error loading directory:', err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      set({ status: 'error', error: message });
    }
  },

  // -------------------------------------------------------------------------
  // Load a directory (either from cache or via user selection)
  // -------------------------------------------------------------------------
  loadDirectory: async (selectNew = false) => {
    get().clearGallery();
    set({ status: 'loading', error: null });

    // Retrieve the directory handle according to the required flow:
    // - If `selectNew` is true, always prompt the user.
    // - Otherwise, try the cached handle first; if none, fall back to prompting.
    let handle: FileSystemDirectoryHandle | null = null;
    if (selectNew) {
      // Force user to pick a directory
      handle = await selectDirectoryHandle();
    } else {
      // Attempt to use a previously cached handle
      handle = await getCachedHandle();
      if (!handle) {
        // No cached handle – prompt the user to select one
        handle = await selectDirectoryHandle();
      }
    }

    // If the user cancelled the picker (or no handle could be obtained), reset state.
    if (!handle) {
      set({
        status: 'idle',
        error: selectNew ? 'Directory selection was cancelled.' : null,
      });
      return;
    }

    const hasPerm = await verifyPermission(handle, true);
    if (!hasPerm) {
      set({
        status: 'permission-denied',
        error: 'Permission to access the directory was denied or revoked.',
      });
      // Keep the handle so the UI can prompt for re‑grant if desired
      get().setDirectoryHandle(handle);
      return;
    }

    get().setDirectoryHandle(handle);
    await get().scanDirectory(handle);
  },

  // -------------------------------------------------------------------------
  // Attempt to load a previously cached directory without prompting the user.
  // -------------------------------------------------------------------------
  tryLoadCached: async () => {
    const handle = await getCachedHandle();
    if (!handle) {
      return;
    }

    const hasSilentPerm = await verifyPermission(handle, false);
    if (!hasSilentPerm) {
      set({
        status: 'permission-req',
        error:
          'Grant permission to access your photo library or pick a new folder.',
      });
      return;
    }

    // Permission is present – set the handle and start scanning
    get().setDirectoryHandle(handle);
    await get().scanDirectory(handle);
  },
}));