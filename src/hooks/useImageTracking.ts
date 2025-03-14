
import { useState, useRef, useEffect } from "react";
import { Logger } from "@/utils/logger";
import { isDuplicateImage } from "@/utils/imageProcessing";

export function useImageTracking() {
  const processedIndexes = useRef<Set<number>>(new Set());
  const processedImageUrls = useRef<Set<string>>(new Set());
  const uniqueImageHashes = useRef<Map<string, string>>(new Map());
  
  const markIndexProcessed = (index: number, imageUrls: string[]) => {
    if (index < 0 || index >= imageUrls.length) {
      Logger.warn(`Cannot mark invalid index ${index} as processed (valid range: 0-${imageUrls.length - 1})`);
      return;
    }
    
    processedIndexes.current.add(index);
    
    if (index >= 0 && index < imageUrls.length) {
      processedImageUrls.current.add(imageUrls[index]);
    }
    
    Logger.info(`Marked index ${index} as processed. Total processed: ${processedIndexes.current.size}/${imageUrls.length}`);
  };

  const isIndexProcessed = (index: number): boolean => {
    return processedIndexes.current.has(index);
  };

  const isImageUrlProcessed = (url: string): boolean => {
    return processedImageUrls.current.has(url);
  };

  const resetProcessedIndexes = () => {
    processedIndexes.current = new Set();
    processedImageUrls.current = new Set();
    uniqueImageHashes.current.clear();
    Logger.info("Reset processed indexes and image URLs");
  };

  const getUnprocessedIndexes = (imageUrls: string[]): number[] => {
    return Array.from({ length: imageUrls.length }, (_, i) => i)
      .filter(i => !processedIndexes.current.has(i));
  };

  const detectDuplicateImages = (imageUrls: string[], preloadedImagesRef: Map<string, HTMLImageElement>) => {
    Logger.info("Checking for duplicate images in current image set");
    const duplicateIndexes: number[] = [];
    
    imageUrls.forEach((url, index) => {
      const img = preloadedImagesRef.get(url);
      if (img) {
        isDuplicateImage(url, img, uniqueImageHashes.current);
      }
    });
    
    const hashesMap = new Map<string, number[]>();
    
    for (const [url, hash] of uniqueImageHashes.current.entries()) {
      const index = imageUrls.indexOf(url);
      if (index === -1) continue;
      
      if (!hashesMap.has(hash)) {
        hashesMap.set(hash, [index]);
      } else {
        hashesMap.get(hash)?.push(index);
      }
    }
    
    for (const [hash, indexes] of hashesMap.entries()) {
      if (indexes.length > 1) {
        const [keepIndex, ...duplicates] = indexes;
        duplicates.forEach(dupIndex => {
          duplicateIndexes.push(dupIndex);
          processedImageUrls.current.add(imageUrls[dupIndex]);
          Logger.warn(`Detected duplicate image at index ${dupIndex} (matches index ${keepIndex})`);
        });
      }
    }
    
    return duplicateIndexes;
  };

  return {
    markIndexProcessed,
    isIndexProcessed,
    isImageUrlProcessed,
    resetProcessedIndexes,
    getUnprocessedIndexes,
    detectDuplicateImages,
    processedImageUrls: processedImageUrls.current,
    uniqueImageHashes: uniqueImageHashes.current
  };
}
