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
        "px-6 cursor-move relative",
        isDragging && "select-none"
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        userSelect: 'none',
        touchAction: 'none',
        position: 'absolute',
        zIndex: isDragging ? 50 : 3,
        width: 'calc(100% - 3rem)',
        left: 0,
        top: '10%'
      }}
      onMouseDown={onMouseDown}
    >
      <h2 
        className="text-center leading-tight break-words mx-auto max-w-[90%]"
        style={textStyle}
      >
        {headline}
      </h2>
    </div>
  );
};