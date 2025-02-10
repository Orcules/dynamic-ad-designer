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