
import React from 'react';
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
          minWidth: '200px',
          padding: '16px 32px',
          fontSize: '1.125rem',
          lineHeight: '1.2',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)'
        }}
        onMouseEnter={() => onButtonHover(true)}
        onMouseLeave={() => onButtonHover(false)}
      >
        <span className="inline-flex items-center gap-2">
          <span>{ctaText}</span>
          {showArrow && (
            <svg 
              className="transition-transform duration-300 inline-block"
              style={{
                transform: isButtonHovered ? 'translateY(4px)' : 'translateY(2px)'
              }}
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M15 3H9a6 6 0 0 0-6 6v12" />
              <path d="M15 3c3.3 0 6 2.7 6 6v12" />
              <path d="M12 9v14" />
              <path d="M8 17l4 4 4-4" />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
};
