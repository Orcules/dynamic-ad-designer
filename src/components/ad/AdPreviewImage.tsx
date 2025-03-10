
import React, { useEffect, useState, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface AdPreviewImageProps {
  imageUrl?: string;
  position: Position;
  onPositionChange: (position: Position) => void;
  onImageLoaded?: () => void;
}

export const AdPreviewImage: React.FC<AdPreviewImageProps> = ({
  imageUrl,
  position,
  onPositionChange,
  onImageLoaded
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(imageUrl);
  const [imageKey, setImageKey] = useState(0);

  useEffect(() => {
    if (imageUrl && imageUrl !== currentImageUrl) {
      console.log('Image URL changed from', currentImageUrl, 'to', imageUrl);
      setLoaded(false);
      setError(false);
      setCurrentImageUrl(imageUrl);
      setImageKey(prev => prev + 1); // Force image reload
    }
  }, [imageUrl, currentImageUrl]);

  // Handle image load to get natural dimensions
  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    const container = img.parentElement;
    
    if (container) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      setContainerSize({ width: containerWidth, height: containerHeight });
      
      // Get image natural dimensions
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      setNaturalSize({ width: imgWidth, height: imgHeight });
    }
    
    setLoaded(true);
    console.log('Image loaded successfully:', imageUrl);
    
    if (onImageLoaded) {
      onImageLoaded();
    }
  }, [imageUrl, onImageLoaded]);

  if (!imageUrl) return null;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black flex items-center justify-center">
      <img
        key={`img-${imageKey}`} // Force re-render of image when URL changes
        src={imageUrl}
        alt="Ad preview"
        className={`absolute transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: 'transform 0.1s ease-out',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center'
        }}
        crossOrigin="anonymous"
        onLoad={handleImageLoad}
        onError={(e) => {
          console.error('Error loading image:', e);
          setError(true);
        }}
      />
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
