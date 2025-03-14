
import React, { useEffect, useState, useCallback, useRef } from 'react';

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
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(imageUrl);
  const [imageKey, setImageKey] = useState(0);
  const [imageStyle, setImageStyle] = useState<React.CSSProperties>({});
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const renderStartTime = useRef<number>(performance.now());
  const positionRef = useRef<Position>(position);

  // Update the position ref whenever the position prop changes
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

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
    
    if (imageUrl && imageUrl !== currentImageUrl) {
      console.log('Image URL changed from', currentImageUrl, 'to', imageUrl);
      
      const cachedImg = imageCache.current.get(imageUrl) || preloadedImage;
      
      if (cachedImg) {
        console.log('Using cached image for faster rendering');
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
            positionRef.current,
            fastMode
          );
          setImageStyle(newStyle);
        }
        
        if (onImageLoaded) {
          setTimeout(() => {
            const renderTime = performance.now() - renderStartTime.current;
            console.log(`Fast cached image render completed in ${renderTime.toFixed(2)}ms`);
            onImageLoaded();
          }, 20);
        }
      } else {
        setLoaded(false);
        setError(false);
        setCurrentImageUrl(imageUrl);
        setImageKey(prev => prev + 1);
      }
    }
  }, [imageUrl, currentImageUrl, onImageLoaded, fastMode, preloadedImage]);

  const calculateStyleFromDimensions = useCallback((
    imgWidth: number,
    imgHeight: number,
    containerWidth: number,
    containerHeight: number,
    pos: Position,
    useFastMode: boolean
  ): React.CSSProperties => {
    const imageAspect = imgWidth / imgHeight;
    const containerAspect = containerWidth / containerHeight;
    
    let width, height;
    
    // Use a higher scale factor to ensure the image fills the container completely
    // Increased from 1.4 to 1.6 to eliminate black borders entirely
    const extraScaleFactor = 1.6;
    
    // Use scaling logic to maintain aspect ratio
    if (imageAspect > containerAspect) {
      // Image is wider than container - scale to fit height
      height = containerHeight * extraScaleFactor;
      width = height * imageAspect;
    } else {
      // Image is taller than container - scale to fit width
      width = containerWidth * extraScaleFactor;
      height = width / imageAspect;
    }
    
    // Improved centering logic
    // For horizontal positioning, we need stronger centering force
    const centeringForceX = 0.2; // Increased from 0.1 to 0.2 (20% correction toward center)
    
    // Calculate the offset from center
    const offsetFromCenterX = (pos.x === 0) ? 0 : pos.x;
    
    // Apply stronger correction to pull the image more toward the center
    const correctedPosX = offsetFromCenterX > 0 ? 
      offsetFromCenterX - (centeringForceX * containerWidth) : 
      offsetFromCenterX + (centeringForceX * containerWidth);
    
    // Calculate final transform position with improved centering applied
    const transformX = correctedPosX - ((width - containerWidth) / 2);
    const transformY = pos.y - ((height - containerHeight) / 2);
    
    return {
      transform: `translate(${transformX}px, ${transformY}px)`,
      width: `${width}px`,
      height: `${height}px`,
      transition: useFastMode ? 'none' : 'transform 0.1s ease-out',
      position: 'absolute',
      objectFit: 'cover' as ObjectFit,
      willChange: 'transform',
      // Ensure image is centered with object-position
      objectPosition: 'center',
    };
  }, []);

  const calculateImageStyle = useCallback((img: HTMLImageElement) => {
    if (!containerRef.current) return {};
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    
    setNaturalSize({ width: imgWidth, height: imgHeight });
    setContainerSize({ width: containerWidth, height: containerHeight });
    
    // Calculate the style with the current position
    return calculateStyleFromDimensions(
      imgWidth,
      imgHeight,
      containerWidth,
      containerHeight,
      positionRef.current,
      fastMode
    );
  }, [calculateStyleFromDimensions, fastMode]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    const loadTime = performance.now() - renderStartTime.current;
    console.log(`Image loaded in ${loadTime.toFixed(2)}ms`);
    
    if (imageUrl && !imageCache.current.has(imageUrl)) {
      imageCache.current.set(imageUrl, img);
    }
    
    setImageStyle(calculateImageStyle(img));
    setLoaded(true);
    
    if (onImageLoaded) {
      const completeTime = performance.now() - renderStartTime.current;
      console.log(`Image processing completed in ${completeTime.toFixed(2)}ms`);
      onImageLoaded();
    }
  }, [imageUrl, onImageLoaded, calculateImageStyle]);

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

  if (!imageUrl) return null;

  return (
    <div 
      ref={containerRef} 
      className={`absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center ${!noBackgroundColor ? 'bg-black' : ''}`}
    >
      <img
        key={`img-${imageKey}`}
        src={imageUrl}
        alt="Ad preview"
        className={`absolute transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={imageStyle}
        crossOrigin="anonymous"
        onLoad={handleImageLoad}
        onError={(e) => {
          console.error('Error loading image:', e);
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
