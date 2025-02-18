
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
  showArrow?: boolean;
}

export const AdCallToAction: React.FC<AdCallToActionProps> = ({
  ctaText = "Experience Nature's Symphony",
  buttonStyle,
  position,
  isButtonHovered,
  onButtonHover,
  showArrow = true
}) => {
  if (!ctaText) return null;

  return (
    <div 
      className="w-full max-w-[90%] mx-auto flex justify-center items-center"
      style={{
        position: 'absolute',
        bottom: '15%',
        left: '50%',
        transform: `translate(-50%, ${position.y}px)`,
        zIndex: 10
      }}
    >
      <button 
        className={cn(
          "relative transform flex items-center justify-center gap-2 mx-auto",
          "px-6 py-2 rounded-full transition-all duration-300"
        )}
        style={{
          ...buttonStyle,
          minWidth: '200px',
          fontSize: 'clamp(0.75rem, 1.5vw, 1rem)'
        }}
        onMouseEnter={() => onButtonHover(true)}
        onMouseLeave={() => onButtonHover(false)}
      >
        <span className="relative z-10">
          {ctaText}
        </span>
        {showArrow && (
          <ArrowBigDown 
            className={cn(
              "w-4 h-4 transition-transform duration-300 relative z-10",
              isButtonHovered ? "translate-y-1" : ""
            )}
          />
        )}
      </button>
    </div>
  );
};
