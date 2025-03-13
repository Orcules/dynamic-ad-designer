
import React, { useCallback, useRef } from 'react';

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
  
  // Use a ref to track if we're currently processing a hover state change
  const isChangingHoverRef = useRef(false);

  // Safe hover state changer
  const safeUpdateHoverState = useCallback((isHovered: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent rapid changes
    if (isChangingHoverRef.current) return;
    isChangingHoverRef.current = true;
    
    // Use requestAnimationFrame to align with browser rendering
    requestAnimationFrame(() => {
      onButtonHover(isHovered);
      isChangingHoverRef.current = false;
    });
  }, [onButtonHover]);
  
  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    safeUpdateHoverState(true, e);
  }, [safeUpdateHoverState]);
  
  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    safeUpdateHoverState(false, e);
  }, [safeUpdateHoverState]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Prevent event bubbling which could cause issues with parent elements
    e.preventDefault();
    e.stopPropagation();
    console.log("Button clicked!");
  }, []);

  return (
    <div 
      className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[90%] flex justify-center items-center z-20"
      style={{
        transform: `translate(-50%, ${position.y}px)`,
        opacity: 1,  // Ensure the button is always visible
        visibility: 'visible', // Explicitly set visibility
        pointerEvents: 'auto' // Ensure clickable
      }}
      data-cta-container="true" // Add a data attribute for easy selection
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
          pointerEvents: 'auto',
          opacity: 1, // Ensure the button is always visible
          visibility: 'visible' // Explicitly set visibility
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        data-cta-button="true" // Add a data attribute for easy selection
      >
        <span className="inline-flex items-center gap-2">
          <span className="cta-text">{ctaText}</span>
          {showArrow && (
            <svg
              className="cta-arrow transition-transform duration-300 inline-block"
              style={{
                transform: isButtonHovered ? 'translateY(0px)' : 'translateY(-1px)'
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
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
};
