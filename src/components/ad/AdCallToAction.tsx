
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
          "relative transform flex items-center justify-center gap-1",
          "px-4 py-1.5 rounded-full transition-all duration-300"
        )}
        style={{
          ...buttonStyle,
          minWidth: '180px',
          height: '40px',
          fontSize: '14px',
          lineHeight: '1',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={() => onButtonHover(true)}
        onMouseLeave={() => onButtonHover(false)}
      >
        <span className="relative z-10 flex items-center justify-center gap-2 h-full">
          {ctaText}
          {showArrow && (
            <ArrowBigDown 
              className={cn(
                "w-5 h-5 transition-transform duration-300",
                isButtonHovered ? "translate-y-0.5" : ""
              )}
              strokeWidth={2.5}
            />
          )}
        </span>
      </button>
    </div>
  );
};
