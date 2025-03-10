
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
}

export const AdPreviewImage: React.FC<AdPreviewImageProps> = ({
  imageUrl,
  position,
  onPositionChange,
  onImageLoaded,
  fastMode = false
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

  useEffect(() => {
    // Update container size on mount and window resize
    const updateContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);

    return () => window.removeEventListener('resize', updateContainerSize);
  }, []);

  useEffect(() => {
    if (imageUrl && imageUrl !== currentImageUrl) {
      console.log('Image URL changed from', currentImageUrl, 'to', imageUrl);
      
      // Check if the image is already cached
      if (imageCache.current.has(imageUrl)) {
        console.log('Using cached image for faster rendering');
        setLoaded(true);
        const cachedImg = imageCache.current.get(imageUrl)!;
        setNaturalSize({ width: cachedImg.naturalWidth, height: cachedImg.naturalHeight });
        
        // Calculate style for cached image immediately
        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          setContainerSize({ width: containerRect.width, height: containerRect.height });
          
          // Apply cached dimensions to calculate style
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
        
        // Notify parent immediately if using cached image
        if (onImageLoaded) {
          setTimeout(onImageLoaded, 50); // Small delay to ensure UI is updated
        }
      } else {
        // Standard loading for new image
        setLoaded(false);
        setError(false);
        setCurrentImageUrl(imageUrl);
        setImageKey(prev => prev + 1); // Force image reload
      }
    }
  }, [imageUrl, currentImageUrl, onImageLoaded, position, fastMode]);

  // Function to calculate style that can be reused
  const calculateStyleFromDimensions = useCallback((
    imgWidth: number,
    imgHeight: number,
    containerWidth: number,
    containerHeight: number,
    pos: Position,
    useFastMode: boolean
  ): React.CSSProperties => {
    // Store these measurements for potential use
    const imageAspect = imgWidth / imgHeight;
    const containerAspect = containerWidth / containerHeight;
    
    // Calculate the exact positioning to match the preview
    const newStyle: React.CSSProperties = {
      transform: `translate(${pos.x}px, ${pos.y}px)`,
      transition: useFastMode ? 'none' : 'transform 0.1s ease-out',
      position: 'absolute',
      objectFit: 'cover',
    };
    
    if (imageAspect > containerAspect) {
      // Image is wider - maintain height and adjust width
      const scaledWidth = containerHeight * imageAspect;
      newStyle.height = '100%';
      newStyle.width = `${scaledWidth}px`;
      newStyle.maxWidth = 'none';
    } else {
      // Image is taller - maintain width and adjust height
      const scaledHeight = containerWidth / imageAspect;
      newStyle.width = '100%';
      newStyle.height = `${scaledHeight}px`;
      newStyle.maxHeight = 'none';
    }
    
    return newStyle;
  }, []);

  const calculateImageStyle = useCallback((img: HTMLImageElement) => {
    if (!containerRef.current) return {};
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    
    // Store these measurements for potential use
    setNaturalSize({ width: imgWidth, height: imgHeight });
    setContainerSize({ width: containerWidth, height: containerHeight });
    
    return calculateStyleFromDimensions(
      imgWidth, imgHeight, containerWidth, containerHeight, position, fastMode
    );
  }, [position, fastMode, calculateStyleFromDimensions]);

  // Preload next image to improve navigation speed
  const preloadImage = useCallback((url: string) => {
    if (!url || imageCache.current.has(url)) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.current.set(url, img);
      console.log(`Preloaded image: ${url.substring(0, 50)}...`);
    };
    img.src = url;
  }, []);

  // Handle image load to get natural dimensions
  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    
    // Cache the loaded image for future use
    if (imageUrl && !imageCache.current.has(imageUrl)) {
      imageCache.current.set(imageUrl, img);
    }
    
    // In fast mode, we skip some of the detailed measurements
    if (!fastMode) {
      setImageStyle(calculateImageStyle(img));
    } else {
      // Simple style for fast mode
      setImageStyle({
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        position: 'absolute',
      });
    }
    
    setLoaded(true);
    
    if (fastMode) {
      // In fast mode, trigger the callback immediately
      if (onImageLoaded) {
        onImageLoaded();
      }
    } else {
      console.log('Image loaded successfully:', imageUrl);
      if (onImageLoaded) {
        onImageLoaded();
      }
    }
  }, [imageUrl, onImageLoaded, fastMode, position, calculateImageStyle]);

  // Low-quality placeholder for faster initial rendering
  const placeholderStyle = fastMode ? {
    filter: 'blur(8px)',
    transform: `translate(${position.x}px, ${position.y}px)`,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    objectPosition: 'center' as const,
    backgroundColor: '#333',
  } : {};

  if (!imageUrl) return null;

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full overflow-hidden bg-black flex items-center justify-center"
    >
      <img
        key={`img-${imageKey}`} // Force re-render of image when URL changes
        src={imageUrl}
        alt="Ad preview"
        className={`absolute transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={imageStyle}
        crossOrigin="anonymous"
        onLoad={handleImageLoad}
        onError={(e) => {
          console.error('Error loading image:', e);
          setError(true);
        }}
      />
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          {fastMode ? 
            <div style={placeholderStyle}></div> : 
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
