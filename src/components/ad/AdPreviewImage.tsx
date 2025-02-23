
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
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
      <img
        src={imageUrl}
        alt="Ad preview"
        className="absolute object-cover"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: 'transform 0.1s ease-out',
          width: 'auto',
          height: '100%',
          minWidth: '100%',
          maxWidth: 'none'
        }}
        crossOrigin="anonymous"
      />
    </div>
  );
};
