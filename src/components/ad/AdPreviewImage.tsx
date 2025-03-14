
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { cleanImageUrl } from '@/utils/imageEffects';
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

// Define the correct ObjectFit type
type ObjectFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

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
  const [cleanedImageUrl, setCleanedImageUrl] = useState<string | undefined>(undefined);
  const [imageKey, setImageKey] = useState(0);
  const [imageStyle, setImageStyle] = useState<React.CSSProperties>({});
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const renderStartTime = useRef<number>(performance.now());

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

  useEffect(() => {
    renderStartTime.current = performance.now();
    
    if (imageUrl) {
      // Clean the image URL first - removed the second parameter that was causing the error
      const cleanUrl = cleanImageUrl(imageUrl);
      
      if (cleanUrl !== cleanedImageUrl) {
        Logger.info(`Image URL changed and cleaned from ${cleanedImageUrl} to ${cleanUrl}`);
        
        const cachedImg = imageCache.current.get(cleanUrl) || preloadedImage;
        
        if (cachedImg) {
          Logger.info('Using cached image for faster rendering');
          setLoaded(true);
          setNaturalSize({ width: cachedImg.naturalWidth, height: cachedImg.naturalHeight });
          
          if (containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            setContainerSize({ width: containerRect.width, height: containerRect.height });
            
            const newStyle = calculateStyleFromDimensions(
              cachedImg.naturalWidth, 
              cachedImg.naturalHeight,
              containerRect.width,
              containerRect.height,
              position,
              fastMode
            );
            setImageStyle(newStyle);
          }
          
          if (onImageLoaded) {
            setTimeout(() => {
              const renderTime = performance.now() - renderStartTime.current;
              Logger.info(`Fast cached image render completed in ${renderTime.toFixed(2)}ms`);
              onImageLoaded();
            }, 20);
          }
        } else {
          setLoaded(false);
          setError(false);
          setCleanedImageUrl(cleanUrl);
          setImageKey(prev => prev + 1);
        }
      }
    }
  }, [imageUrl, cleanedImageUrl, onImageLoaded, position, fastMode, preloadedImage]);

  const preserveAspectRatio = (
    imgWidth: number, 
    imgHeight: number, 
    containerWidth: number, 
    containerHeight: number, 
    objectFit: 'contain' | 'cover' = 'cover'
  ) => {
    const imgRatio = imgWidth / imgHeight;
    const containerRatio = containerWidth / containerHeight;
    
    let width, height, x = 0, y = 0;
    
    if (objectFit === 'contain') {
      if (imgRatio > containerRatio) {
        width = containerWidth;
        height = containerWidth / imgRatio;
        y = (containerHeight - height) / 2;
      } else {
        height = containerHeight;
        width = containerHeight * imgRatio;
        x = (containerWidth - width) / 2;
      }
    } else { // cover
      if (imgRatio > containerRatio) {
        height = containerHeight;
        width = containerHeight * imgRatio;
        x = (containerWidth - width) / 2;
      } else {
        width = containerWidth;
        height = containerWidth / imgRatio;
        y = (containerHeight - height) / 2;
      }
    }
    
    return { width, height, x, y };
  };

  const calculateStyleFromDimensions = useCallback((
    imgWidth: number,
    imgHeight: number,
    containerWidth: number,
    containerHeight: number,
    pos: Position,
    useFastMode: boolean
  ): React.CSSProperties => {
    // Use the preserveAspectRatio helper to maintain aspect ratio
    const dimensions = preserveAspectRatio(
      imgWidth, 
      imgHeight, 
      containerWidth, 
      containerHeight, 
      'cover'
    );
    
    return {
      transform: `translate(${pos.x}px, ${pos.y}px)`,
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      left: `${dimensions.x}px`,
      top: `${dimensions.y}px`,
      transition: useFastMode ? 'none' : 'transform 0.1s ease-out',
      position: 'absolute',
      objectFit: 'cover' as ObjectFit,
      willChange: 'transform',
    };
  }, []);

  const calculateImageStyle = useCallback((img: HTMLImageElement) => {
    if (!containerRef.current) return {};
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    
    Logger.info(`Image dimensions: ${imgWidth}x${imgHeight}, Container: ${containerWidth}x${containerHeight}`);
    
    setNaturalSize({ width: imgWidth, height: imgHeight });
    setContainerSize({ width: containerWidth, height: containerHeight });
    
    // Use the preserveAspectRatio helper
    const dimensions = preserveAspectRatio(
      imgWidth, 
      imgHeight, 
      containerWidth, 
      containerHeight, 
      'cover'
    );
    
    return {
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      left: `${dimensions.x}px`,
      top: `${dimensions.y}px`,
      transform: `translate(${position.x}px, ${position.y}px)`,
      transition: fastMode ? 'none' : 'transform 0.1s ease-out',
      position: 'absolute' as const,
      objectFit: 'cover' as ObjectFit,
      willChange: 'transform',
    };
  }, [position, fastMode]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    const loadTime = performance.now() - renderStartTime.current;
    Logger.info(`Image loaded in ${loadTime.toFixed(2)}ms, dimensions: ${img.naturalWidth}x${img.naturalHeight}`);
    
    if (cleanedImageUrl && !imageCache.current.has(cleanedImageUrl)) {
      imageCache.current.set(cleanedImageUrl, img);
    }
    
    setImageStyle(calculateImageStyle(img));
    setLoaded(true);
    
    if (onImageLoaded) {
      const completeTime = performance.now() - renderStartTime.current;
      Logger.info(`Image processing completed in ${completeTime.toFixed(2)}ms`);
      onImageLoaded();
    }
  }, [cleanedImageUrl, onImageLoaded, calculateImageStyle]);

  const placeholderStyle: React.CSSProperties = {
    filter: 'blur(1px)',
    transform: `translate(${position.x}px, ${position.y}px)`,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as ObjectFit,
    objectPosition: 'center',
    backgroundColor: '#333',
    willChange: 'transform'
  };

  if (!imageUrl && !cleanedImageUrl) return null;

  return (
    <div 
      ref={containerRef} 
      className={`absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center ${!noBackgroundColor ? 'bg-black' : ''}`}
    >
      <img
        key={`img-${imageKey}`}
        src={cleanedImageUrl || (imageUrl ? cleanImageUrl(imageUrl) : '')}
        alt="Ad preview"
        className={`absolute transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={imageStyle}
        crossOrigin="anonymous"
        onLoad={handleImageLoad}
        onError={(e) => {
          Logger.error('Error loading image:', e);
          setError(true);
        }}
        loading={fastMode ? 'eager' : 'lazy'}
        decoding="async"
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
};
