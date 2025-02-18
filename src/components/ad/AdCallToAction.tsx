
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
        className="relative transform rounded-full transition-all duration-300 overflow-hidden whitespace-nowrap"
        style={{
          ...buttonStyle,
          minWidth: '180px',
          padding: '12px 24px',
          fontSize: '14px',
          lineHeight: '1'
        }}
        onMouseEnter={() => onButtonHover(true)}
        onMouseLeave={() => onButtonHover(false)}
      >
        <div className="relative z-10 flex items-center justify-center h-5">
          <div className="flex items-center gap-2">
            <span>{ctaText}</span>
            {showArrow && (
              <ArrowBigDown 
                className={cn(
                  "transition-transform duration-300",
                  isButtonHovered ? "translate-y-0.5" : ""
                )}
                size={20}
                strokeWidth={2.5}
              />
            )}
          </div>
        </div>
      </button>
    </div>
  );
};
