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
}

export const AdDescription: React.FC<AdDescriptionProps> = ({
  description,
  descriptionStyle,
  position,
}) => {
  if (!description) return null;

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