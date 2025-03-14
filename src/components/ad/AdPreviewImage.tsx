
import React, { useEffect } from 'react';
import { useImageLoadHandling } from '@/hooks/useImageLoadHandling';
import { useImagePosition } from '@/hooks/useImagePosition';
import { ImageLoadingState } from './ImageLoadingState';

interface Position {
  x: number;
  y: number;
}

interface AdPreviewImageProps {
  imageUrl?: string;
  position: Position;
  onPositionChange: (position: Position) => void;
  onImageLoaded?: () => void;
  fastMode?: boolean;
  noBackgroundColor?: boolean;
  preloadedImage?: HTMLImageElement | null;
}

export const AdPreviewImage: React.FC<AdPreviewImageProps> = ({
  imageUrl,
  position,
  onPositionChange,
  onImageLoaded,
  fastMode = false,
  noBackgroundColor = false,
  preloadedImage = null
}) => {
  const {
    loaded,
    setLoaded,
    error,
    handleImageLoad,
    handleImageError,
    isUnmounted
  } = useImageLoadHandling(imageUrl, onImageLoaded);

  const {
    containerRef,
    imageStyle,
    applyCropOnLoad
  } = useImagePosition(position, fastMode);

  const imageRef = React.useRef<HTMLImageElement>(null);

  // Handle loaded image
  const handleImageProcessing = (e: React.SyntheticEvent<HTMLImageElement>) => {
    handleImageLoad(e);
    applyCropOnLoad(e.target as HTMLImageElement);
  };

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (imageRef.current) {
        // Clear src to stop any ongoing loads
        imageRef.current.src = '';
      }
      
      // Clear any cached URLs
      if (imageUrl) {
        try {
          URL.revokeObjectURL(imageUrl);
        } catch (e) {
          // Ignore errors - this might not be an object URL
        }
      }
    };
  }, [imageUrl]);

  if (!imageUrl) return null;

  return (
    <div 
      ref={containerRef} 
      className={`absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center ${!noBackgroundColor ? 'bg-black' : ''}`}
      data-image-container="true"
    >
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Ad preview"
        className={`transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={imageStyle}
        crossOrigin="anonymous"
        onLoad={handleImageProcessing}
        onError={handleImageError}
        loading={fastMode ? 'eager' : 'lazy'}
        decoding="async"
        data-preview-image="true"
      />
      <ImageLoadingState isLoading={!loaded} hasError={error} />
    </div>
  );
};
