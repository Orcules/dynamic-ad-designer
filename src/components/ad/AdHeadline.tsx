import React from 'react';
import { cn } from "@/lib/utils";

interface AdHeadlineProps {
  headline?: string;
  textStyle: any;
  isDragging: boolean;
  position: { x: number; y: number };
  onMouseDown: (e: React.MouseEvent) => void;
}

export const AdHeadline: React.FC<AdHeadlineProps> = ({
  headline,
  textStyle,
  isDragging,
  position,
  onMouseDown
}) => {
  if (!headline) return null;

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
        zIndex: isDragging ? 50 : 3,
        top: '10%',
        left: '50%',
        marginLeft: '-45%'
      }}
      onMouseDown={onMouseDown}
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