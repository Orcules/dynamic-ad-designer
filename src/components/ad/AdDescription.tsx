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
        "px-6 cursor-move relative",
        isDragging && "select-none"
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        userSelect: 'none',
        touchAction: 'none',
        position: 'absolute',
        zIndex: isDragging ? 50 : 2,
        width: 'calc(100% - 3rem)',
        left: 0,
        top: '40%'
      }}
      onMouseDown={onMouseDown}
    >
      <p 
        className="text-center leading-tight break-words mx-auto max-w-[90%]"
        style={descriptionStyle}
      >
        {description}
      </p>
    </div>
  );
};