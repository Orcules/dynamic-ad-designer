
import React from 'react';

interface ImageContainerProps {
  ref: React.RefObject<HTMLDivElement>;
  showBackground: boolean;
  children: React.ReactNode;
}

export const ImageContainer: React.FC<ImageContainerProps> = React.forwardRef<
  HTMLDivElement,
  Omit<ImageContainerProps, 'ref'>
>(({ showBackground, children }, ref) => {
  return (
    <div 
      ref={ref} 
      className={`absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center ${!showBackground ? 'bg-black' : ''}`}
      data-image-container="true"
    >
      {children}
    </div>
  );
});

ImageContainer.displayName = 'ImageContainer';
