
import { useRef, useEffect } from "react";
import { Logger } from "@/utils/logger";
import { preloadImage } from "@/utils/imageProcessing";
import { isDuplicateImage } from "@/utils/imageProcessing";

export function useImagePreloading() {
  const imageCacheRef = useRef<Map<string, boolean>>(new Map());
  const preloadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const uniqueImageHashes = useRef<Map<string, string>>(new Map());
  
  // Clean up memory when component unmounts
  useEffect(() => {
    return () => {
      // Clear caches
      imageCacheRef.current.clear();
      preloadedImagesRef.current.clear();
      uniqueImageHashes.current.clear();
    };
  }, []);

  const preloadImageWithCache = (url: string, processedImageUrls?: Set<string>) => {
    if (!url) return;
    
    preloadImage(
      url, 
      (img) => {
        // Check if it's a duplicate after preloading
        if (processedImageUrls && isDuplicateImage(url, img, uniqueImageHashes.current)) {
          Logger.warn(`Image ${url.substring(0, 30)}... will be flagged as a duplicate`);
          processedImageUrls.add(url);
        }
      },
      () => {}, // on error
      imageCacheRef.current,
      preloadedImagesRef.current
    );
  };

  const getPreloadedImage = (url: string): HTMLImageElement | null => {
    return preloadedImagesRef.current.get(url) || null;
  };

  return {
    preloadImage: preloadImageWithCache,
    getPreloadedImage,
    imageCacheRef,
    preloadedImagesRef,
    uniqueImageHashes: uniqueImageHashes.current
  };
}
