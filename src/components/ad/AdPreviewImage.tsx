
import React, { useEffect, useState, useRef } from 'react';
import { calculateCoverDimensions, calculateCropDimensions } from '@/utils/imageEffects';
import { Logger } from '@/utils/logger';

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
  const loadAttemptCount = useRef(0);
  const initialLoadComplete = useRef(false);
  const styleUpdateTimeoutRef = useRef<number | null>(null);
  const isUnmounted = useRef(false);
  const renderCount = useRef(0);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      isUnmounted.current = true;
      if (styleUpdateTimeoutRef.current) {
        window.clearTimeout(styleUpdateTimeoutRef.current);
      }
      
      // Clear image element references to help garbage collection
      imageElementRef.current = null;
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
      
      // Release memory by removing style references
      setImageStyle({});
      setNaturalSize({ width: 0, height: 0 });
    };
  }, []);

  // Apply physical crop on load with performance optimizations
  const applyCropOnLoad = (img: HTMLImageElement) => {
    if (!containerRef.current || isUnmounted.current) return;
    
    try {
      // Limit updates if we're rendering too frequently
      renderCount.current += 1;
      if (renderCount.current > 10) { // Reduced from 20 to 10
        console.log('Too many render cycles in AdPreviewImage, limiting updates');
        setTimeout(() => { renderCount.current = 0; }, 1000); // Reduced from 2000 to 1000ms
        return;
      }
      
      const containerRect = containerRef.current.getBoundingClientRect();
      imageElementRef.current = img;
      
      // Make sure we have accurate natural dimensions
      const imgWidth = img.naturalWidth || img.width; 
      const imgHeight = img.naturalHeight || img.height;
      
      // Only update state if dimensions are valid and have changed
      if (imgWidth > 0 && imgHeight > 0 && 
          (imgWidth !== naturalSize.width || imgHeight !== naturalSize.height)) {
        setNaturalSize({ width: imgWidth, height: imgHeight });
      }
      
      if (!initialLoadComplete.current) {
        initialLoadComplete.current = true;
        
        // If the position is (0,0), ensure the image is properly centered
        if (position.x === 0 && position.y === 0) {
          if (styleUpdateTimeoutRef.current) {
            window.clearTimeout(styleUpdateTimeoutRef.current);
          }
          styleUpdateTimeoutRef.current = window.setTimeout(() => {
            if (!isUnmounted.current) updateImageStyle(position);
          }, 50);
        }
      }
      
      setLoaded(true);
      updateImageStyle(position);
      
      if (onImageLoaded && !isUnmounted.current) {
        try {
          // Add small delay to ensure rendering is complete
          setTimeout(() => {
            if (!isUnmounted.current && onImageLoaded) {
              onImageLoaded();
            }
          }, 10);
        } catch (callbackError) {
          console.error('Error in onImageLoaded callback:', callbackError);
        }
      }
    } catch (err) {
      console.error("Error in applyCropOnLoad:", err);
      // Still set loaded to true to avoid infinite loading state
      setLoaded(true);
    }
  };

  // Track position changes and apply immediately
  useEffect(() => {
    positionRef.current = position;
    if (loaded && containerRef.current && !isUnmounted.current) {
      // Compare with last position to detect actual movements
      if (position.x !== lastPositionRef.current.x || position.y !== lastPositionRef.current.y) {
        lastPositionRef.current = {...position};
        
        // Clear any pending timeout
        if (styleUpdateTimeoutRef.current) {
          window.clearTimeout(styleUpdateTimeoutRef.current);
        }
        
        // Update immediately
        updateImageStyle(position);
        
        // Removed the second update for better performance
      }
    }
    
    return () => {
      if (styleUpdateTimeoutRef.current) {
        window.clearTimeout(styleUpdateTimeoutRef.current);
      }
    };
  }, [position, loaded]);

  // Update container size with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateContainerSize = () => {
      if (containerRef.current && loaded && !isUnmounted.current) {
        updateImageStyle(positionRef.current);
      }
    };
    
    let resizeObserver: ResizeObserver;
    try {
      resizeObserver = new ResizeObserver(() => {
        // Debounce resize operations for better performance
        if (styleUpdateTimeoutRef.current) {
          window.clearTimeout(styleUpdateTimeoutRef.current);
        }
        
        styleUpdateTimeoutRef.current = window.setTimeout(() => {
          updateContainerSize();
        }, 200); // Increased from 100ms to 200ms for less frequent updates
      });
      
      resizeObserver.observe(containerRef.current);
      updateContainerSize();
    } catch (err) {
      console.error("Error setting up ResizeObserver:", err);
    }
    
    return () => {
      try {
        if (resizeObserver && containerRef.current) {
          resizeObserver.unobserve(containerRef.current);
        }
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      } catch (err) {
        console.error("Error cleaning up ResizeObserver:", err);
      }
    };
  }, [loaded]);

  // Helper function to update image style based on position
  const updateImageStyle = (pos: Position) => {
    if (!containerRef.current || !imageElementRef.current || isUnmounted.current) return;
    
    try {
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Get latest natural dimensions from the actual element
      const imgWidth = imageElementRef.current.naturalWidth || naturalSize.width;
      const imgHeight = imageElementRef.current.naturalHeight || naturalSize.height;
      
      if (imgWidth === 0 || imgHeight === 0) {
        console.warn('Image has zero dimensions, cannot calculate cover style');
        return;
      }
      
      // Default to centered position if pos is (0,0)
      const effectivePos = (pos.x === 0 && pos.y === 0) ? 
        { x: 0, y: 0 } : // This will ensure default centering behavior
        pos;
      
      // Calculate dimensions that ensure the image completely covers the container
      const coverDimensions = calculateCoverDimensions(
        imgWidth,
        imgHeight,
        containerRect.width,
        containerRect.height,
        effectivePos.x,
        effectivePos.y
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
        willChange: fastMode ? 'none' : 'left, top', // Reduce GPU load when in fast mode
        zIndex: 1,
      });
    } catch (err) {
      console.error("Error in updateImageStyle:", err);
    }
  };

  // Safe image load handler with proper error handling and retry
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    try {
      if (isUnmounted.current) return;
      
      loadAttemptCount.current = 0; // Reset load attempts on success
      const img = e.target as HTMLImageElement;
      applyCropOnLoad(img);
    } catch (error) {
      console.error('Error in handleImageLoad:', error);
      setError(true);
    }
  };

  // Retry loading if image fails, but limit retries
  const handleImageError = () => {
    if (isUnmounted.current) return;
    
    setError(true);
    if (loadAttemptCount.current < 1 && imageUrl) { // Reduced from 2 to 1 retry
      loadAttemptCount.current++;
      console.warn(`Image load failed, retrying (${loadAttemptCount.current}/1)...`);
      
      // Retry with a slight delay
      setTimeout(() => {
        if (isUnmounted.current) return;
        
        if (imageRef.current && imageUrl) {
          imageRef.current.src = imageUrl + '?retry=' + Date.now();
        }
      }, 500);
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
        onError={handleImageError}
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
