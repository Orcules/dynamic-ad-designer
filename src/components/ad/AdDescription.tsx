
import React from 'react';
import { cn } from "@/lib/utils";

interface Position {
  x: number;
  y: number;
}

interface AdDescriptionProps {
  description?: string;
  descriptionStyle: any;
  position: Position;
  onPositionChange?: (position: Position) => void;
}

export const AdDescription: React.FC<AdDescriptionProps> = ({
  description,
  descriptionStyle,
  position,
  onPositionChange
}) => {
  if (!description) return null;

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!onPositionChange) return;
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
    <div 
      className="w-full max-w-[90%] mx-auto px-4 relative"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.1s ease-out',
        position: 'absolute',
        zIndex: 2,
        top: '40%',
        left: '50%',
        marginLeft: '-45%'
      }}
    >
      <p 
        className="text-center leading-tight break-words"
        style={{
          ...descriptionStyle,
          fontSize: 'clamp(0.875rem, 2.5vw, 1.25rem)',
          maxWidth: '100%',
          overflowWrap: 'break-word',
          wordWrap: 'break-word',
          hyphens: 'auto'
        }}
      >
        {description}
      </p>
    </div>
  );
};
