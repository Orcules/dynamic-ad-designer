
import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(imageUrl);
  const [imageKey, setImageKey] = useState(0);
  const [imageStyle, setImageStyle] = useState<React.CSSProperties>({});
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const renderStartTime = useRef<number>(performance.now());
  const loadStartTime = useRef<number>(0);
  const previousImageUrl = useRef<string | undefined>(undefined);
  const forceUpdateFlag = useRef<boolean>(false);

  // Safely handle container size updates with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
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
  }, []);

  // Handle image URL changes and caching
  useEffect(() => {
    renderStartTime.current = performance.now();
    
    if (imageUrl && (imageUrl !== currentImageUrl || forceUpdateFlag.current)) {
      forceUpdateFlag.current = false;
      
      if (previousImageUrl.current && previousImageUrl.current !== imageUrl) {
        console.log(`Image URL changing from "${previousImageUrl.current.substring(0, 50)}..." to "${imageUrl.substring(0, 50)}..."`);
        loadStartTime.current = performance.now();
      }
      
      previousImageUrl.current = imageUrl;
      
      const cachedImg = imageCache.current.get(imageUrl) || preloadedImage;
      
      if (cachedImg) {
        console.log('Using cached image for faster rendering');
        setLoaded(true);
        setNaturalSize({ width: cachedImg.naturalWidth, height: cachedImg.naturalHeight });
        
        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          setContainerSize({ width: containerRect.width, height: containerRect.height });
          
          const coverDimensions = calculateCoverDimensions(
            cachedImg.naturalWidth,
            cachedImg.naturalHeight,
            containerRect.width,
            containerRect.height,
            position.x,
            position.y
          );
          
          const newStyle = {
            width: `${coverDimensions.width}px`,
            height: `${coverDimensions.height}px`,
            position: 'absolute' as const,
            left: `${coverDimensions.x}px`,
            top: `${coverDimensions.y}px`,
            transform: 'none',
            transition: fastMode ? 'none' : 'all 0.1s ease-out',
            objectFit: 'cover' as const,
            objectPosition: 'center',
            willChange: 'left, top',
            zIndex: 1,
            minWidth: '120%', // Reduced from 150% to 120% for less extreme zoom
            minHeight: '120%', // Reduced from 150% to 120% for less extreme zoom
          };
          
          setImageStyle(newStyle);
        }
        
        if (onImageLoaded) {
          // Use a small timeout to prevent potential timing issues
          setTimeout(() => {
            try {
              const renderTime = performance.now() - renderStartTime.current;
              console.log(`Fast cached image render completed in ${renderTime.toFixed(2)}ms`);
              onImageLoaded();
            } catch (e) {
              console.error('Error in onImageLoaded callback:', e);
            }
          }, 20);
        }
      } else {
        setLoaded(false);
        setError(false);
        setCurrentImageUrl(imageUrl);
        setImageKey(prev => prev + 1);
      }
    }
  }, [imageUrl, currentImageUrl, onImageLoaded, position, fastMode, preloadedImage]);

  // Update image position when position or natural size changes
  useEffect(() => {
    if (imageUrl && loaded) {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        
        const coverDimensions = calculateCoverDimensions(
          naturalSize.width,
          naturalSize.height,
          containerRect.width,
          containerRect.height,
          position.x,
          position.y
        );
        
        setImageStyle({
          width: `${coverDimensions.width}px`,
          height: `${coverDimensions.height}px`,
          position: 'absolute',
          left: `${coverDimensions.x}px`,
          top: `${coverDimensions.y}px`,
          transform: 'none',
          transition: fastMode ? 'none' : 'all 0.1s ease-out',
          objectFit: 'cover',
          objectPosition: 'center',
          willChange: 'left, top',
          zIndex: 1,
          minWidth: '120%', // Reduced from 150% to 120% for less extreme zoom
          minHeight: '120%', // Reduced from 150% to 120% for less extreme zoom
        });
      }
    }
  }, [position, naturalSize, loaded, imageUrl, fastMode]);

  // Safe image load handler with proper error handling
  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    try {
      const img = e.target as HTMLImageElement;
      const loadTime = performance.now() - loadStartTime.current;
      console.log(`Image loaded in ${loadTime.toFixed(2)}ms`);
      
      if (imageUrl && !imageCache.current.has(imageUrl)) {
        imageCache.current.set(imageUrl, img);
      }
      
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        
        const coverDimensions = calculateCoverDimensions(
          img.naturalWidth,
          img.naturalHeight,
          containerRect.width,
          containerRect.height,
          position.x,
          position.y
        );
        
        const newStyle = {
          width: `${coverDimensions.width}px`,
          height: `${coverDimensions.height}px`,
          position: 'absolute' as const,
          left: `${coverDimensions.x}px`,
          top: `${coverDimensions.y}px`,
          transform: 'none',
          transition: fastMode ? 'none' : 'all 0.1s ease-out',
          objectFit: 'cover' as const,
          objectPosition: 'center',
          willChange: 'left, top',
          zIndex: 1,
          minWidth: '120%', // Reduced from 150% to 120% for less extreme zoom
          minHeight: '120%', // Reduced from 150% to 120% for less extreme zoom
        };
        
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        setImageStyle(newStyle);
      }
      
      setLoaded(true);
      
      if (onImageLoaded) {
        try {
          const completeTime = performance.now() - renderStartTime.current;
          console.log(`Image processing completed in ${completeTime.toFixed(2)}ms`);
          console.log('Image render completed in', performance.now() - renderStartTime.current, 'ms');
          onImageLoaded();
        } catch (callbackError) {
          console.error('Error in onImageLoaded callback:', callbackError);
        }
      }
    } catch (error) {
      console.error('Error in handleImageLoad:', error);
      setError(true);
    }
  }, [imageUrl, onImageLoaded, fastMode, position]);

  const forceUpdate = useCallback(() => {
    forceUpdateFlag.current = true;
    setImageKey(prev => prev + 1);
  }, []);

  const placeholderStyle: React.CSSProperties = fastMode ? {
    filter: 'blur(1px)',
    transform: `translate(${position.x}px, ${position.y}px)`,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    backgroundColor: '#333',
    willChange: 'transform'
  } : {};

  if (!imageUrl) return null;

  return (
    <div 
      ref={containerRef} 
      className={`absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center ${!noBackgroundColor ? 'bg-black' : ''}`}
      data-image-container="true"
    >
      <img
        key={`img-${imageKey}`}
        src={imageUrl}
        alt="Ad preview"
        className={`transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={imageStyle}
        crossOrigin="anonymous"
        onLoad={handleImageLoad}
        onError={(e) => {
          console.error('Error loading image:', e);
          setError(true);
        }}
        loading={fastMode ? 'eager' : 'lazy'}
        decoding="async"
        data-preview-image="true"
      />
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          {fastMode ? 
            <div style={placeholderStyle}></div> : 
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          }
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
          <p>Failed to load image</p>
        </div>
      )}
    </div>
  );
}
