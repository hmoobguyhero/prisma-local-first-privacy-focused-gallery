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
// Explicitly define props for the custom renderer to fix TS2315
interface CustomRenderPhotoProps {
  photo: PhotoMetadata;
  imageProps: React.ImgHTMLAttributes<HTMLImageElement> & {
    alt: string;
    title?: string;
    sizes?: string;
    onClick: (event: React.MouseEvent<HTMLImageElement>) => void;
  };
  wrapperStyle: React.CSSProperties;
}
const CustomRenderPhoto = ({
  photo,
  imageProps: { alt, title, sizes, className, onClick, style },
  wrapperStyle,
}: CustomRenderPhotoProps) => {
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
        style={style}
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
      columns={(containerWidth) => {
        if (containerWidth < 768) return 2;
        if (containerWidth < 1024) return 3;
        return 4;
      }}
      sizes={{
        size: "calc(100vw - 40px)",
        sizes: [
            { viewport: "(max-width: 299px)", size: "calc(100vw - 20px)" },
            { viewport: "(max-width: 599px)", size: "calc(100vw - 30px)" },
            { viewport: "(max-width: 1199px)", size: "calc(100vw - 40px)" },
        ],
      }}
      spacing={4}
      onClick={({ index }) => onPhotoClick(index)}
      // @ts-expect-error The 'renderPhoto' prop is not recognized by the type system in "masonry" layout, but it is supported by the library.
      renderPhoto={CustomRenderPhoto}
    />
  );
}