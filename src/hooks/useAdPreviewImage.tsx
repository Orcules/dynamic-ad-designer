
import React from 'react';

interface PreloadedImagesOptions {
  imageUrls: string[];
  currentIndex: number;
}

export function useAdPreviewImage({ imageUrls, currentIndex }: PreloadedImagesOptions) {
  const preloadedImages = React.useRef<Set<string>>(new Set());
  const currentImageUrl = React.useRef<string | undefined>();
  const renderStartTime = React.useRef<number>(performance.now());
  
  React.useEffect(() => {
    renderStartTime.current = performance.now();
  }, []);

  React.useEffect(() => {
    if (imageUrls.length <= 1) return;
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const imagesToPreload = [];
        
        if (currentIndex >= 0 && currentIndex < imageUrls.length) {
          imagesToPreload.push(imageUrls[currentIndex]);
        }
        
        if (currentIndex + 1 < imageUrls.length) {
          imagesToPreload.push(imageUrls[currentIndex + 1]);
        }
        
        if (currentIndex - 1 >= 0) {
          imagesToPreload.push(imageUrls[currentIndex - 1]);
        }
        
        imagesToPreload.forEach(url => {
          if (url && !preloadedImages.current.has(url)) {
            const img = new Image();
            img.src = url;
            img.crossOrigin = "anonymous";
            preloadedImages.current.add(url);
          }
        });
      }
    }, { threshold: 0.1 });
    
    const adPreviewElement = document.querySelector('.ad-content');
    if (adPreviewElement) {
      observer.observe(adPreviewElement);
    }
    
    return () => {
      if (adPreviewElement) {
        observer.unobserve(adPreviewElement);
      }
      observer.disconnect();
    };
  }, [imageUrls, currentIndex]);

  const updateImageUrl = React.useCallback((imageUrl: string | undefined) => {
    if (imageUrl !== currentImageUrl.current) {
      console.log(`AdPreviewContent detected image URL change: ${currentImageUrl.current} → ${imageUrl}`);
      currentImageUrl.current = imageUrl;
    }
  }, []);

  const getLoadTime = () => {
    return performance.now() - renderStartTime.current;
  };

  return {
    updateImageUrl,
    getLoadTime
  };
}
