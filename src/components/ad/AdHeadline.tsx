
import React from 'react';
import { cn } from "@/lib/utils";

interface Position {
  x: number;
  y: number;
}

interface AdHeadlineProps {
  headline?: string;
  textStyle: any;
  position: Position;
  onPositionChange?: (position: Position) => void;
}

export const AdHeadline: React.FC<AdHeadlineProps> = ({
  headline,
  textStyle,
  position,
  onPositionChange
}) => {
  if (!headline) return null;

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
        zIndex: 3,
        top: '10%',
        left: '50%',
        marginLeft: '-45%'
      }}
    >
      <h2 
        className="text-center leading-tight break-words"
        style={{
          ...textStyle,
          fontSize: 'clamp(1.25rem, 4vw, 2.5rem)',
          maxWidth: '100%',
          overflowWrap: 'break-word',
          wordWrap: 'break-word',
          hyphens: 'auto'
        }}
      >
        {headline}
      </h2>
    </div>
  );
};
