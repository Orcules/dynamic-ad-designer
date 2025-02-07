import React from 'react';
import { cn } from "@/lib/utils";

interface AdDescriptionProps {
  description?: string;
  descriptionStyle: any;
  isDragging: boolean;
  position: { x: number; y: number };
  onMouseDown: (e: React.MouseEvent) => void;
}

export const AdDescription: React.FC<AdDescriptionProps> = ({
  description,
  descriptionStyle,
  isDragging,
  position,
  onMouseDown
}) => {
  if (!description) return null;

  return (
    <div 
      className={cn(
        "w-full max-w-[90%] mx-auto px-4 cursor-move relative",
        isDragging && "select-none"
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        userSelect: 'none',
        touchAction: 'none',
        position: 'absolute',
        zIndex: isDragging ? 50 : 2,
        top: '40%',
        left: '50%',
        marginLeft: '-45%'
      }}
      onMouseDown={onMouseDown}
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