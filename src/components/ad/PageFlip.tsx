
import React from 'react';

interface PageFlipProps {
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const PageFlip: React.FC<PageFlipProps> = ({
  position = 'bottom-right',
  size = 'medium',
  color = '#f3f3f3'
}) => {
  // Size mapping
  const sizeMap = {
    small: {
      width: '40px',
      height: '40px',
      foldSize: '15px',
    },
    medium: {
      width: '60px',
      height: '60px',
      foldSize: '20px',
    },
    large: {
      width: '80px',
      height: '80px',
      foldSize: '25px',
    }
  };

  // Position mapping
  const posMap = {
    'top-right': { top: 0, right: 0, transform: 'rotate(90deg)', origin: 'top right' },
    'bottom-right': { bottom: 0, right: 0, transform: 'rotate(0deg)', origin: 'bottom right' },
    'top-left': { top: 0, left: 0, transform: 'rotate(180deg)', origin: 'top left' },
    'bottom-left': { bottom: 0, left: 0, transform: 'rotate(-90deg)', origin: 'bottom left' }
  };

  const { width, height, foldSize } = sizeMap[size];
  const posStyle = posMap[position];

  return (
    <div
      className="absolute z-10 pointer-events-none page-flip"
      style={{
        width,
        height,
        ...posStyle,
        transformOrigin: posStyle.origin,
      }}
    >
      <div
        className="absolute"
        style={{
          width,
          height,
          background: color,
          boxShadow: '0 0 10px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* You can add content inside the page if needed */}
      </div>
      <div
        className="absolute pointer-events-none"
        style={{
          width: foldSize,
          height: foldSize,
          bottom: '0',
          right: '0',
          background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)',
          transformOrigin: 'bottom right',
          zIndex: 2,
        }}
      />
    </div>
  );
};
