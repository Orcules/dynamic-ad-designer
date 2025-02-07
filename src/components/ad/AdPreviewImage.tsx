import React, { useRef, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

interface AdPreviewImageProps {
  imageUrl?: string;
  onPositionChange: (position: Position) => void;
}

export const AdPreviewImage: React.FC<AdPreviewImageProps> = ({
  imageUrl,
  onPositionChange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    const bounds = imageRef.current.getBoundingClientRect();
    const container = imageRef.current.parentElement?.getBoundingClientRect();
    
    if (!container) return;
    
    const maxX = 0;
    const minX = container.width - bounds.width;
    const maxY = 0;
    const minY = container.height - bounds.height;
    
    const newPosition = {
      x: Math.min(maxX, Math.max(minX, newX)),
      y: Math.min(maxY, Math.max(minY, newY))
    };
    
    setImagePosition(newPosition);
    onPositionChange(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!imageUrl) return null;

  return (
    <img
      ref={imageRef}
      src={imageUrl}
      alt="Ad preview"
      className="absolute inset-0 h-full w-full object-cover cursor-move"
      style={{
        transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      crossOrigin="anonymous"
    />
  );
};