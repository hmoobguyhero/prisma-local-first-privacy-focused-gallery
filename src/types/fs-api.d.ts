// Type definitions for the File System Access API
// https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
// These are not yet part of the default TS DOM library
interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
  isSameEntry(other: FileSystemHandle): Promise<boolean>;
  queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
  requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
}
interface FileSystemFileHandle extends FileSystemHandle {
  kind: 'file';
  getFile(): Promise<File>;
  createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>;
}
interface FileSystemDirectoryHandle extends FileSystemHandle {
  kind: 'directory';
  getDirectoryHandle(name: string, options?: FileSystemGetDirectoryOptions): Promise<FileSystemDirectoryHandle>;
  getFileHandle(name: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandle>;
  removeEntry(name: string, options?: FileSystemRemoveOptions): Promise<void>;
  resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
  keys(): AsyncIterable<string>;
  values(): AsyncIterable<FileSystemFileHandle | FileSystemDirectoryHandle>;
  entries(): AsyncIterable<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>;
  [Symbol.asyncIterator](): AsyncIterable<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>;
}
interface FileSystemHandlePermissionDescriptor {
  mode?: 'read' | 'readwrite';
}
type FileSystemPermissionMode = 'read' | 'readwrite';
interface FileSystemCreateWritableOptions {
  keepExistingData?: boolean;
}
interface FileSystemGetDirectoryOptions {
  create?: boolean;
}
interface FileSystemGetFileOptions {
  create?: boolean;
}
interface FileSystemRemoveOptions {
  recursive?: boolean;
}
interface FileSystemWritableFileStream extends WritableStream {
  write(data: FileSystemWriteChunkType): Promise<void>;
  seek(position: number): Promise<void>;
  truncate(size: number): Promise<void>;
}
type FileSystemWriteChunkType = BufferSource | Blob | string;
interface Window {
  showDirectoryPicker(options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;
}
interface DirectoryPickerOptions {
  id?: string;
  mode?: 'read' | 'readwrite';
  startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos' | FileSystemHandle;
}