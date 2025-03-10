
import React, { useEffect, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

interface AdPreviewImageProps {
  imageUrl?: string;
  position: Position;
  onPositionChange: (position: Position) => void;
}

export const AdPreviewImage: React.FC<AdPreviewImageProps> = ({
  imageUrl,
  position,
  onPositionChange
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [fitStyle, setFitStyle] = useState<'width' | 'height'>('height');

  useEffect(() => {
    if (imageUrl) {
      setLoaded(false);
      setError(false);
    }
  }, [imageUrl]);

  // Handle image load to get natural dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
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
      
      // Calculate aspect ratios
      const imageAspectRatio = imgWidth / imgHeight;
      const containerAspectRatio = containerWidth / containerHeight;
      
      // Determine if we should fit to width or height
      if (imageAspectRatio > containerAspectRatio) {
        // Image is wider than container (like monkey) - fit to width
        setFitStyle('width');
      } else {
        // Image is taller than container (like motorcycle guy) - fit to height
        setFitStyle('height');
      }
    }
    
    setLoaded(true);
  };

  if (!imageUrl) return null;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black flex items-center justify-center">
      <img
        src={imageUrl}
        alt="Ad preview"
        className={`absolute transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: 'transform 0.1s ease-out',
          // Apply different fitting based on aspect ratio
          width: fitStyle === 'width' ? '100%' : 'auto',
          height: fitStyle === 'height' ? '100%' : 'auto',
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
