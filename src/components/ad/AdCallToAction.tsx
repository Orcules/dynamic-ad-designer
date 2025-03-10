
import React, { useCallback, useState } from 'react';

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
  
  // Local state to manage hover interactions
  const [isHovering, setIsHovering] = useState(false);

  // Use safe event handlers with useCallback for better performance
  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use local state first
    setIsHovering(true);
    
    // Then use setTimeout to defer the parent state update
    setTimeout(() => {
      onButtonHover(true);
    }, 50);
  }, [onButtonHover]);
  
  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use local state first
    setIsHovering(false);
    
    // Then use setTimeout to defer the parent state update
    setTimeout(() => {
      onButtonHover(false);
    }, 50);
  }, [onButtonHover]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Prevent event bubbling which could cause issues with parent elements
    e.preventDefault();
    e.stopPropagation();
    console.log("Button clicked!");
  }, []);

  // Use the local state for immediate visual feedback
  const hoverState = isHovering || isButtonHovered;

  return (
    <div 
      className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[90%] flex justify-center items-center z-20"
      style={{
        transform: `translate(-50%, ${position.y}px)`,
      }}
    >
      <button 
        className="relative transform rounded-full transition-all duration-300 overflow-hidden whitespace-nowrap inline-flex items-center justify-center cursor-pointer"
        style={{
          ...buttonStyle,
          minWidth: '200px',
          padding: '16px 32px',
          fontSize: '1.125rem',
          lineHeight: '1.2',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: 30,
          pointerEvents: 'auto'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <span className="inline-flex items-center gap-2">
          <span>{ctaText}</span>
          {showArrow && (
            <svg
              className="transition-transform duration-300 inline-block"
              style={{
                transform: hoverState ? 'translateY(4px)' : 'translateY(2px)'
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
              <path d="M13 20.5L6.5 14l6.5-6.5" />
              <path d="M17.5 20.5l-6.5-6.5 6.5-6.5" />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
}
