import React from 'react';
import { ArrowBigDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Position {
  x: number;
  y: number;
}

interface AdCallToActionProps {
  ctaText?: string;
  buttonStyle: any;
  position: Position;
  isButtonHovered: boolean;
  onButtonHover: (isHovered: boolean) => void;
}

export const AdCallToAction: React.FC<AdCallToActionProps> = ({
  ctaText,
  buttonStyle,
  position,
  isButtonHovered,
  onButtonHover
}) => {
  if (!ctaText) return null;

  return (
    <div 
      className="w-full max-w-[90%] mx-auto flex justify-center items-center relative"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.1s ease-out',
        position: 'absolute',
        zIndex: 1,
        bottom: '10%',
        left: '50%',
        marginLeft: '-45%'
      }}
    >
      <div 
        className="relative transform flex items-center justify-center gap-2 mx-auto"
        style={{
          ...buttonStyle,
          fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
          maxWidth: '100%',
          padding: 'clamp(0.5rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem)'
        }}
        onMouseEnter={() => onButtonHover(true)}
        onMouseLeave={() => onButtonHover(false)}
      >
        <span className="block whitespace-nowrap overflow-hidden text-ellipsis">
          {ctaText}
        </span>
        <ArrowBigDown 
          className={cn(
            "w-4 h-4 transition-transform duration-300",
            isButtonHovered ? "translate-y-1" : ""
          )}
        />
      </div>
    </div>
  );
};