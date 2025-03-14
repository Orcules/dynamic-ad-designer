
import React from 'react';

interface ImageLoadingStateProps {
  isLoading: boolean;
  hasError: boolean;
}

export const ImageLoadingState: React.FC<ImageLoadingStateProps> = ({ isLoading, hasError }) => {
  if (isLoading && !hasError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (hasError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
        <p>Failed to load image</p>
      </div>
    );
  }
  
  return null;
};
