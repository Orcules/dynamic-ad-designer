
import React, { useEffect, useState, useRef } from 'react';
import { calculateCoverDimensions } from '@/utils/imageEffects';

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
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [imageStyle, setImageStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const positionRef = useRef<Position>(position);
  const lastPositionRef = useRef<Position>(position);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Apply physical crop on load
  const applyCropOnLoad = (img: HTMLImageElement) => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    imageElementRef.current = img;
    
    // Make sure we have accurate natural dimensions
    setNaturalSize({ 
      width: img.naturalWidth || img.width, 
      height: img.naturalHeight || img.height 
    });
    
    setLoaded(true);
    updateImageStyle(position);
    
    if (onImageLoaded) {
      try {
        onImageLoaded();
      } catch (callbackError) {
        console.error('Error in onImageLoaded callback:', callbackError);
      }
    }
  };

  // Track position changes and apply immediately
  useEffect(() => {
    positionRef.current = position;
    if (loaded && containerRef.current) {
      // Compare with last position to detect actual movements
      if (position.x !== lastPositionRef.current.x || position.y !== lastPositionRef.current.y) {
        lastPositionRef.current = {...position};
        updateImageStyle(position);
      }
    }
  }, [position, loaded]);

  // Update container size with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateContainerSize = () => {
      if (containerRef.current && loaded) {
        updateImageStyle(positionRef.current);
      }
    };
    
    const resizeObserver = new ResizeObserver(() => {
      updateContainerSize();
    });
    
    resizeObserver.observe(containerRef.current);
    updateContainerSize();
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [loaded]);

  // Helper function to update image style based on position
  const updateImageStyle = (pos: Position) => {
    if (!containerRef.current || !imageElementRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate dimensions that ensure the image completely covers the container
    const coverDimensions = calculateCoverDimensions(
      naturalSize.width,
      naturalSize.height,
      containerRect.width,
      containerRect.height,
      pos.x,
      pos.y
    );
    
    // Apply the styles with fixed positioning 
    setImageStyle({
      width: `${coverDimensions.width}px`,
      height: `${coverDimensions.height}px`,
      position: 'absolute',
      left: `${coverDimensions.x}px`,
      top: `${coverDimensions.y}px`,
      transform: 'none',
      transition: fastMode ? 'none' : 'width 0.1s ease-out, height 0.1s ease-out, left 0.1s ease-out, top 0.1s ease-out',
      objectFit: 'cover',
      objectPosition: 'center',
      willChange: 'left, top, width, height',
      zIndex: 1,
    });
    
    // Log dimensions for debugging
    console.log('Image dimensions:', {
      natural: naturalSize,
      container: {
        width: containerRect.width,
        height: containerRect.height
      },
      cover: coverDimensions,
      position: pos
    });
  };

  // Safe image load handler with proper error handling
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    try {
      const img = e.target as HTMLImageElement;
      applyCropOnLoad(img);
    } catch (error) {
      console.error('Error in handleImageLoad:', error);
      setError(true);
    }
  };

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
        onLoad={handleImageLoad}
        onError={() => setError(true)}
        loading={fastMode ? 'eager' : 'lazy'}
        decoding="async"
        data-preview-image="true"
      />
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
          <p>Failed to load image</p>
        </div>
      )}
    </div>
  );
};
