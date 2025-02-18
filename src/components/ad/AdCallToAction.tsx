
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
      className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[90%] flex justify-center items-center"
      style={{
        transform: `translate(-50%, ${position.y}px)`,
        zIndex: 10
      }}
    >
      <button 
        className="relative transform rounded-full transition-all duration-300 overflow-hidden whitespace-nowrap inline-flex items-center justify-center"
        style={{
          ...buttonStyle,
          minWidth: '180px',
          padding: '12px 24px',
          fontSize: '14px',
          lineHeight: '1',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)'
        }}
        onMouseEnter={() => onButtonHover(true)}
        onMouseLeave={() => onButtonHover(false)}
      >
        <span className="inline-flex items-center gap-2">
          <span className="translate-y-[-8px]">{ctaText}</span>
          {showArrow && (
            <ArrowBigDown 
              className={cn(
                "transition-transform duration-300 inline-block",
                isButtonHovered ? "translate-y-0.5" : ""
              )}
              size={20}
              strokeWidth={2.5}
            />
          )}
        </span>
      </button>
    </div>
  );
};
