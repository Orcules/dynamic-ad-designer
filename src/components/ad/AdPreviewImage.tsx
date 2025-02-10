
import React from 'react';

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
  if (!imageUrl) return null;

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 10;
    switch (direction) {
      case 'up':
        onPositionChange({ ...position, y: position.y - step });
        break;
      case 'down':
        onPositionChange({ ...position, y: position.y + step });
        break;
      case 'left':
        onPositionChange({ ...position, x: position.x - step });
        break;
      case 'right':
        onPositionChange({ ...position, x: position.x + step });
        break;
    }
  };

  return (
    <img
      src={imageUrl}
      alt="Ad preview"
      className="absolute inset-0 h-full w-full object-cover"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.1s ease-out'
      }}
      crossOrigin="anonymous"
    />
  );
};
