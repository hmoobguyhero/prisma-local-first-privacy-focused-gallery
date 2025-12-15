import { get, set } from 'idb-keyval';
import exifr from 'exifr';
import type { PhotoMetadata } from '@shared/types';
const DIRECTORY_HANDLE_KEY = 'prisma-gallery-directory-handle';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
// --- Directory Handle Management ---
export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  await set(DIRECTORY_HANDLE_KEY, handle);
}
export async function getDirectoryHandle(fromCache = true): Promise<FileSystemDirectoryHandle | null> {
  if (fromCache) {
    const handle = await get<FileSystemDirectoryHandle>(DIRECTORY_HANDLE_KEY);
    if (handle) {
      return handle;
    }
  }
  try {
    const handle = await window.showDirectoryPicker();
    await saveDirectoryHandle(handle);
    return handle;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('User cancelled the directory picker.');
    } else {
      console.error('Error picking directory:', error);
    }
    return null;
  }
}
export async function verifyPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const options = { mode: 'read' as FileSystemPermissionMode };
  if ((await handle.queryPermission(options)) === 'granted') {
    return true;
  }
  if ((await handle.requestPermission(options)) === 'granted') {
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