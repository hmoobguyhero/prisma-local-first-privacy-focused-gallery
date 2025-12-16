import { get, set } from 'idb-keyval';
import exifr from 'exifr';
import type { PhotoMetadata } from '@shared/types';
const DIRECTORY_HANDLE_KEY = 'prisma-gallery-directory-handle';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
// --- Directory Handle Management ---
export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  await set(DIRECTORY_HANDLE_KEY, handle);
}
/**
 * Retrieve the cached directory handle from IndexedDB (if any).
 */
export async function getCachedHandle(): Promise<FileSystemDirectoryHandle | null> {
  const handle = await get<FileSystemDirectoryHandle>(DIRECTORY_HANDLE_KEY);
  return handle || null;
}
/**
 * Prompt the user to select a directory and cache the handle.
 */
export async function selectDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const handle = await window.showDirectoryPicker();
    await saveDirectoryHandle(handle);
    return handle;
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'AbortError') {
        console.log('User cancelled the directory picker.');
      } else if (error.name === 'SecurityError') {
        console.warn('Directory picker blocked due to security restrictions (e.g., running in an iframe). For full functionality, run locally or deploy to a dedicated domain.');
      } else {
        console.error(`Directory picker failed with a DOMException (${error.name}):`, error.message);
      }
    } else {
      console.error('An unexpected error occurred during directory picking:', error);
    }
    return null;
  }
}
export async function verifyPermission(
  handle: FileSystemDirectoryHandle,
  allowRequestPermission = true
): Promise<boolean> {
  // `mode` must be a literal `'read'` for the Permission API
  const opts: { mode: 'read' } = { mode: 'read' };
  if ((await handle.queryPermission(opts)) === 'granted') {
    return true;
  }
  if (!allowRequestPermission) {
    return false;
  }
  if ((await handle.requestPermission(opts)) === 'granted') {
    return true;
  }
  console.error('Permission denied for directory handle.');
  return false;
}
// --- File Scanning and Processing ---
export async function* scanFiles(directoryHandle: FileSystemDirectoryHandle): AsyncGenerator<FileSystemFileHandle> {
  for await (const entry of directoryHandle.values()) {
    if (entry.kind === 'file') {
      const isImage = IMAGE_EXTENSIONS.some(ext => entry.name.toLowerCase().endsWith(ext));
      if (isImage) {
        yield entry;
      }
    } else if (entry.kind === 'directory') {
      yield* scanFiles(entry);
    }
  }
}
export async function processFile(fileHandle: FileSystemFileHandle): Promise<PhotoMetadata | null> {
  try {
    const file = await fileHandle.getFile();
    const src = URL.createObjectURL(file);
    const exifData = await exifr.parse(file, [
      'Make',
      'Model',
      'ExposureTime',
      'FNumber',
      'ISOSpeedRatings',
      'DateTimeOriginal',
      'OffsetTimeOriginal',
      'latitude',
      'longitude',
    ]);
    // Basic dimensions check
    const image = new Image();
    const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
      image.onload = () => {
        resolve({ width: image.width, height: image.height });
      };
      image.onerror = () => {
        resolve({ width: 0, height: 0 }); // Fallback
      };
      image.src = src;
    });
    if (dimensions.width === 0 || dimensions.height === 0) {
      URL.revokeObjectURL(src);
      return null;
    }
    return {
      handle: fileHandle,
      name: file.name,
      src,
      width: dimensions.width,
      height: dimensions.height,
      exif: {
        make: exifData?.Make,
        model: exifData?.Model,
        exposureTime: exifData?.ExposureTime,
        fNumber: exifData?.FNumber,
        iso: exifData?.ISOSpeedRatings,
        dateTimeOriginal: exifData?.DateTimeOriginal,
        gps: (exifData?.latitude && exifData?.longitude)
          ? { latitude: exifData.latitude, longitude: exifData.longitude }
          : undefined,
      },
    };
  } catch (error) {
    console.error(`Failed to process file ${fileHandle.name}:`, error);
    return null;
  }
}