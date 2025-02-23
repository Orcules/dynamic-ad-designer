
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
}

export const AdHeadline: React.FC<AdHeadlineProps> = ({
  headline,
  textStyle,
  position,
}) => {
  if (!headline) return null;

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
          fontSize: 'clamp(1.75rem, 5vw, 3rem)',
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
