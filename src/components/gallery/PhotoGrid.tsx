import React from 'react';
import PhotoAlbum from 'react-photo-album';
import { motion } from 'framer-motion';
import type { PhotoMetadata } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
interface PhotoGridProps {
  photos: PhotoMetadata[];
  onPhotoClick: (index: number) => void;
}
const NextJsImage = ({
  photo,
  imageProps: { alt, title, sizes, className, onClick },
  wrapperStyle,
}: {
  photo: PhotoMetadata;
  imageProps: {
    alt: string;
    title: string;
    sizes: string;
    className: string;
    onClick: () => void;
  };
  wrapperStyle: React.CSSProperties;
}) => {
  return (
    <motion.div
      style={{ ...wrapperStyle, position: 'relative', overflow: 'hidden' }}
      className="rounded-lg group"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <img
        src={photo.src}
        alt={alt}
        title={title}
        sizes={sizes}
        onClick={onClick}
        className={cn('object-cover w-full h-full transition-transform duration-300 group-hover:scale-105', className)}
      />
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};
export function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
  if (!photos.length) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="w-full aspect-square rounded-lg" />
        ))}
      </div>
    );
  }
  return (
    <PhotoAlbum
      photos={photos}
      layout="masonry"
      defaultWidth={300}
      sizes="(max-width: 768px) 50vw, 100vw"
      spacing={4}
      onClick={({ index }) => onPhotoClick(index)}
      renderPhoto={NextJsImage}
    />
  );
}