
import React, { useRef, useState, useCallback } from 'react';

/**
 * Hook to handle image loading, errors, and retries
 */
export function useImageLoadHandling(imageUrl?: string, onImageLoaded?: () => void) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const loadAttemptCount = useRef(0);
  const isUnmounted = useRef(false);
  
  // Clean up resources when component unmounts
  React.useEffect(() => {
    return () => {
      isUnmounted.current = true;
    };
  }, []);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    try {
      if (isUnmounted.current) return;
      
      loadAttemptCount.current = 0; // Reset load attempts on success
      setLoaded(true);
      
      if (onImageLoaded && !isUnmounted.current) {
        try {
          // Add small delay to ensure rendering is complete
          setTimeout(() => {
            if (!isUnmounted.current && onImageLoaded) {
              onImageLoaded();
            }
          }, 10);
        } catch (callbackError) {
          console.error('Error in onImageLoaded callback:', callbackError);
        }
      }
    } catch (error) {
      console.error('Error in handleImageLoad:', error);
      setError(true);
    }
  }, [onImageLoaded]);

  // Retry loading if image fails, but limit retries
  const handleImageError = useCallback(() => {
    if (isUnmounted.current) return;
    
    setError(true);
    if (loadAttemptCount.current < 1 && imageUrl) { // Maximum of 1 retry attempt
      loadAttemptCount.current++;
      console.warn(`Image load failed, retrying (${loadAttemptCount.current}/1)...`);
      
      // Retry with a slight delay
      setTimeout(() => {
        if (isUnmounted.current) return;
        setError(false); // Reset error state for retry
      }, 500);
    }
  }, [imageUrl]);

  return {
    loaded,
    setLoaded,
    error,
    setError,
    handleImageLoad,
    handleImageError,
    isUnmounted
  };
}
