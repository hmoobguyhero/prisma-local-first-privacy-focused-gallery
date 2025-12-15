import React from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import { format } from 'date-fns';
import { Camera, Aperture, Clock, Hash, MapPin, Calendar } from 'lucide-react';
import type { PhotoMetadata } from '@shared/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
interface ExifDataDisplayProps {
  photo: PhotoMetadata;
}
function ExifDataDisplay({ photo }: ExifDataDisplayProps) {
  const { exif } = photo;
  if (!exif) return null;
  const exifItems = [
    { icon: Camera, label: 'Camera', value: exif.model ? `${exif.make} ${exif.model}` : exif.make },
    { icon: Aperture, label: 'Aperture', value: exif.fNumber ? `ƒ/${exif.fNumber}` : null },
    { icon: Clock, label: 'Shutter Speed', value: exif.exposureTime ? `1/${Math.round(1 / exif.exposureTime)}s` : null },
    { icon: Hash, label: 'ISO', value: exif.iso },
    { icon: Calendar, label: 'Date Taken', value: exif.dateTimeOriginal ? format(new Date(exif.dateTimeOriginal), 'PPP p') : null },
    { icon: MapPin, label: 'GPS', value: exif.gps ? `${exif.gps.latitude.toFixed(4)}, ${exif.gps.longitude.toFixed(4)}` : null },
  ].filter(item => item.value);
  if (exifItems.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No EXIF data available for this image.
      </div>
    );
  }
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Photo Details</h3>
      <Separator />
      <ul className="space-y-3">
        {exifItems.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex items-start text-sm">
            <Icon className="mr-3 h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
            <div>
              <span className="font-medium text-foreground">{label}</span>
              <p className="text-muted-foreground">{value}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
interface GalleryLightboxProps {
  open: boolean;
  index: number;
  photos: PhotoMetadata[];
  onClose: () => void;
}
export function GalleryLightbox({ open, index, photos, onClose }: GalleryLightboxProps) {
  const [showExif, setShowExif] = React.useState(true);
  const slides = photos.map(photo => ({
    src: photo.src,
    width: photo.width,
    height: photo.height,
    title: photo.name,
  }));
  const currentPhoto = photos[index];
  return (
    <Lightbox
      open={open}
      index={index}
      close={onClose}
      slides={slides}
      plugins={[Captions, Thumbnails]}
      styles={{
        container: { backgroundColor: 'rgba(10, 10, 20, 0.95)' },
        captionsTitle: { fontFamily: 'inherit' },
        captionsDescription: { fontFamily: 'inherit' },
      }}
      render={{
        slide: ({ slide, rect }) => (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={slide.src}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              alt={slide.title || ''}
            />
            {showExif && currentPhoto && (
              <div
                className="absolute right-0 top-0 bottom-0 w-72 bg-background/80 backdrop-blur-sm border-l border-border animate-fade-in"
                onClick={e => e.stopPropagation()}
              >
                <ScrollArea className="h-full">
                  <ExifDataDisplay photo={currentPhoto} />
                </ScrollArea>
              </div>
            )}
          </div>
        ),
      }}
    />
  );
}