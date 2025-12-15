// --- Original Demo Types ---
export interface DemoItem {
  id: string;
  name: string;
  value: number;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// --- Prisma Gallery Types ---
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  layout: 'rows' | 'columns' | 'masonry';
  sortOrder: 'date-asc' | 'date-desc' | 'name-asc' | 'name-desc';
}
export interface ExifData {
  make?: string;
  model?: string;
  exposureTime?: number;
  fNumber?: number;
  iso?: number;
  dateTimeOriginal?: Date;
  gps?: {
    latitude: number;
    longitude: number;
  };
}
export interface PhotoMetadata {
  handle: FileSystemFileHandle;
  name: string;
  src: string;
  width: number;
  height: number;
  exif: ExifData;
}