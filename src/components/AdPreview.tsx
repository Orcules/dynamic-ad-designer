import React, { useState } from 'react';

interface AdPreviewProps {
  imageUrl?: string;
  width: number;
  height: number;
  headline?: string;
  ctaText?: string;
  templateStyle?: string;
  accentColor?: string;
  fontUrl?: string;
}

export const AdPreview: React.FC<AdPreviewProps> = ({
  imageUrl,
  width,
  height,
  headline,
  ctaText,
  templateStyle = 'minimal',
  accentColor = '#4A90E2',
  fontUrl,
}) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  return (
    <div 
      className="relative bg-white shadow-lg rounded-lg overflow-hidden ad-preview"
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        fontFamily: fontUrl ? `'${fontUrl}', sans-serif` : 'inherit'
      }}
    >
      <div className="absolute inset-0 ad-content">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Ad preview"
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-4">
          {headline && (
            <h2 className="text-2xl font-bold leading-tight">{headline}</h2>
          )}
          
          {ctaText && (
            <button
              className="px-6 py-2 rounded-full transition-all duration-300 transform"
              style={{
                backgroundColor: isButtonHovered ? `${accentColor}dd` : accentColor,
                transform: isButtonHovered ? 'scale(1.05)' : 'scale(1)',
              }}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
            >
              {ctaText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};