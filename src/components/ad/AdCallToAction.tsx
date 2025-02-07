import React from 'react';
import { ArrowBigDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdCallToActionProps {
  ctaText?: string;
  buttonStyle: any;
  isDragging: boolean;
  position: { x: number; y: number };
  onMouseDown: (e: React.MouseEvent) => void;
  isButtonHovered: boolean;
  onButtonHover: (isHovered: boolean) => void;
}

export const AdCallToAction: React.FC<AdCallToActionProps> = ({
  ctaText,
  buttonStyle,
  isDragging,
  position,
  onMouseDown,
  isButtonHovered,
  onButtonHover
}) => {
  if (!ctaText) return null;

  return (
    <div 
      className={cn(
        "w-full flex justify-center items-center cursor-move relative",
        isDragging && "select-none"
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        userSelect: 'none',
        touchAction: 'none',
        position: 'absolute',
        zIndex: isDragging ? 50 : 1,
        bottom: '10%',
        left: 0
      }}
      onMouseDown={onMouseDown}
    >
      <div 
        className="relative transform flex items-center justify-center gap-2 mx-auto"
        style={buttonStyle}
        onMouseEnter={() => onButtonHover(true)}
        onMouseLeave={() => onButtonHover(false)}
      >
        <span className="block">
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