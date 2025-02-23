
import React, { useEffect, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface AdPreviewImageProps {
  imageUrl?: string;
  position: Position;
  onPositionChange: (position: Position) => void;
}

export const AdPreviewImage: React.FC<AdPreviewImageProps> = ({
  imageUrl,
  position,
  onPositionChange
}) => {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && imageUrl) {
      imgRef.current.crossOrigin = 'anonymous';
      
      // Add error handling for image loading
      const handleError = () => {
        console.error('Failed to load image:', imageUrl);
        if (imageUrl.startsWith('blob:')) {
          // If blob URL fails, try loading through cors-proxy
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`;
          imgRef.current!.src = proxyUrl;
        }
      };
      
      imgRef.current.addEventListener('error', handleError);
      return () => {
        if (imgRef.current) {
          imgRef.current.removeEventListener('error', handleError);
        }
      };
    }
  }, [imageUrl]);

  if (!imageUrl) return null;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <img
        ref={imgRef}
        src={imageUrl}
        alt="Ad preview"
        className="absolute w-full h-full object-cover"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: 'transform 0.1s ease-out',
          maxWidth: 'none',
          maxHeight: 'none'
        }}
        crossOrigin="anonymous"
      />
    </div>
  );
};
