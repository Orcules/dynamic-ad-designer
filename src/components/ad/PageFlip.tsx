
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
      {/* Triangle fold effect */}
      <div
        className="absolute"
        style={{
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderWidth: position === 'bottom-right' ? `0 0 ${height} ${width}` : 
                      position === 'top-right' ? `${height} 0 0 ${width}` :
                      position === 'bottom-left' ? `0 ${width} ${height} 0` :
                      `${height} ${width} 0 0`,
          borderColor: position === 'bottom-right' ? `transparent transparent ${color} transparent` :
                      position === 'top-right' ? `${color} transparent transparent transparent` :
                      position === 'bottom-left' ? `transparent transparent ${color} transparent` :
                      `${color} transparent transparent transparent`,
          boxShadow: '0 0 5px rgba(0,0,0,0.2)',
        }}
      />
      
      {/* Fold shadow line */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: position === 'bottom-right' || position === 'top-right' ? foldSize : width,
          height: position === 'bottom-right' || position === 'top-right' ? height : foldSize,
          bottom: position === 'bottom-right' || position === 'bottom-left' ? '0' : 'auto',
          right: position === 'bottom-right' || position === 'top-right' ? '0' : 'auto',
          top: position === 'top-right' || position === 'top-left' ? '0' : 'auto',
          left: position === 'bottom-left' || position === 'top-left' ? '0' : 'auto',
          background: position === 'bottom-right' ? 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)' :
                    position === 'top-right' ? 'linear-gradient(45deg, transparent 50%, rgba(0,0,0,0.1) 50%)' :
                    position === 'bottom-left' ? 'linear-gradient(225deg, transparent 50%, rgba(0,0,0,0.1) 50%)' :
                    'linear-gradient(315deg, transparent 50%, rgba(0,0,0,0.1) 50%)',
          transformOrigin: posStyle.origin,
          zIndex: 2,
        }}
      />
    </div>
  );
};
