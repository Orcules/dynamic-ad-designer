
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
      try {
        // Clear caches
        imageCacheRef.current?.clear();
        preloadedImagesRef.current?.clear();
        uniqueImageHashes.current?.clear();
        Logger.info("Image cache cleared on unmount");
      } catch (error) {
        Logger.error(`Error clearing image cache: ${error}`);
      }
    };
  }, []);

  const preloadImageWithCache = (url: string, processedImageUrls?: Set<string>) => {
    // Safety check for server-side rendering or initialization
    if (typeof window === 'undefined' || !url) {
      Logger.warn("Preload attempted with invalid URL or in SSR context");
      return;
    }
    
    try {
      preloadImage(
        url, 
        (img) => {
          try {
            // Check if it's a duplicate after preloading
            if (processedImageUrls && isDuplicateImage(url, img, uniqueImageHashes.current)) {
              Logger.warn(`Image ${url.substring(0, 30)}... will be flagged as a duplicate`);
              processedImageUrls.add(url);
            }
          } catch (error) {
            // Silently handle errors during preloading to prevent app crashes
            Logger.error(`Error during image duplicate check: ${error}`);
          }
        },
        () => {
          // On error - just log, don't crash
          Logger.warn(`Failed to preload image: ${url.substring(0, 30)}...`);
        }, 
        imageCacheRef.current,
        preloadedImagesRef.current
      );
    } catch (err) {
      Logger.error(`Error in preloadImageWithCache: ${err}`);
    }
  };

  const getPreloadedImage = (url: string): HTMLImageElement | null => {
    // Safety check for server-side rendering
    if (typeof window === 'undefined' || !url) return null;
    
    try {
      return preloadedImagesRef.current.get(url) || null;
    } catch (err) {
      Logger.error(`Error getting preloaded image: ${err}`);
      return null;
    }
  };

  return {
    preloadImage: preloadImageWithCache,
    getPreloadedImage,
    imageCacheRef,
    preloadedImagesRef,
    uniqueImageHashes: uniqueImageHashes.current
  };
}
