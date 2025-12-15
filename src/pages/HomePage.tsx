import React, { useEffect, useState } from 'react';
import { FolderUp, Image, Loader2, Settings, XCircle } from 'lucide-react';
import { useGalleryStore } from '@/store/gallery-store';
import { DirectoryPicker } from '@/components/gallery/DirectoryPicker';
import { PhotoGrid } from '@/components/gallery/PhotoGrid';
import { GalleryLightbox } from '@/components/gallery/Lightbox';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from '@/components/ThemeToggle';
function LoadingOverlay() {
  const status = useGalleryStore(s => s.status);
  const { found, processed } = useGalleryStore(s => s.scanStats);
  const message = status === 'scanning'
    ? `Scanning for images... Found ${found}`
    : `Processing images... ${processed} of ${found}`;
  const progress = found > 0 ? (processed / found) * 100 : 0;
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-4 text-center">
        <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
        <h2 className="text-2xl font-semibold text-foreground">{message}</h2>
        {status === 'processing' && (
          <Progress value={progress} className="w-full" />
        )}
        <p className="text-muted-foreground">Please wait, this may take a moment for large libraries.</p>
      </div>
    </div>
  );
}
function Header() {
  const directoryName = useGalleryStore(s => s.directoryName);
  const photoCount = useGalleryStore(s => s.photos.length);
  const loadDirectory = useGalleryStore(s => s.loadDirectory);
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Image className="h-8 w-8 text-primary" />
            <div className="hidden sm:block">
              <h1 className="text-xl font-semibold text-foreground">Prisma Gallery</h1>
              {directoryName && (
                <p className="text-sm text-muted-foreground">
                  {directoryName} ({photoCount} items)
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => loadDirectory(false)}>
              <FolderUp className="mr-2 h-4 w-4" />
              Change Folder
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
export function HomePage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const loadDirectory = useGalleryStore(s => s.loadDirectory);
  const directoryHandle = useGalleryStore(s => s.directoryHandle);
  const directoryName = useGalleryStore(s => s.directoryName);
  const photos = useGalleryStore(s => s.photos);
  const status = useGalleryStore(s => s.status);
  const error = useGalleryStore(s => s.error);
  useEffect(() => {
    loadDirectory(true);
  }, [loadDirectory]);
  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index);
  };
  const closeLightbox = () => {
    setLightboxIndex(null);
  };
  const showLoading = status === 'loading' || status === 'scanning' || status === 'processing';
  const showPicker = status === 'idle' || status === 'permission-denied' || (status === 'error' && !directoryHandle);
  const showGrid = status === 'ready' || (status === 'error' && !!directoryHandle);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ThemeToggle className="fixed top-4 right-4" />
      {showLoading && <LoadingOverlay />}
      {showPicker && (
        <div className="flex items-center justify-center h-screen">
          <DirectoryPicker
            onSelectDirectory={() => loadDirectory(false)}
            hasCachedHandle={!!directoryHandle}
            directoryName={directoryName}
          />
        </div>
      )}
      {showGrid && (
        <>
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8 md:py-10 lg:py-12">
              {error && (
                <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 text-destructive-foreground rounded-lg flex items-center gap-3">
                  <XCircle className="h-5 w-5" />
                  <div>
                    <h3 className="font-semibold">An error occurred</h3>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}
              <PhotoGrid photos={photos} onPhotoClick={handlePhotoClick} />
            </div>
          </main>
        </>
      )}
      {lightboxIndex !== null && (
        <GalleryLightbox
          open={lightboxIndex !== null}
          index={lightboxIndex}
          photos={photos}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}