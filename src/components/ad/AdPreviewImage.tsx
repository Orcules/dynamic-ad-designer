
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
  const [isWiderThanFrame, setIsWiderThanFrame] = useState(false);

  useEffect(() => {
    if (imageUrl) {
      setLoaded(false);
      setError(false);
    }
  }, [imageUrl]);

  // Handle image load to get natural dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    const containerWidth = img.parentElement?.clientWidth || 0;
    const containerHeight = img.parentElement?.clientHeight || 0;
    
    const imageAspect = img.naturalWidth / img.naturalHeight;
    const containerAspect = containerWidth / containerHeight;
    
    // Check if image is wider than container (relative to height)
    setIsWiderThanFrame(imageAspect > containerAspect);
    
    setNaturalSize({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
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
          // For wider images, fit to height instead of width
          width: isWiderThanFrame ? 'auto' : '100%',
          height: isWiderThanFrame ? '100%' : 'auto',
          objectFit: 'contain',
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
