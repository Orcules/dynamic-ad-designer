
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

  useEffect(() => {
    if (imageUrl) {
      setLoaded(false);
      setError(false);
    }
  }, [imageUrl]);

  if (!imageUrl) return null;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
      <img
        src={imageUrl}
        alt="Ad preview"
        className={`absolute object-cover w-full h-full transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: 'transform 0.1s ease-out'
        }}
        crossOrigin="anonymous"
        onLoad={() => setLoaded(true)}
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
