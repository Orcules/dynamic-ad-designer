
import { Logger } from "@/utils/logger";

/**
 * Generate a simple hash for an image to detect duplicates
 */
export const generateImageHash = (img: HTMLImageElement): string => {
  const canvas = document.createElement('canvas');
  const size = Math.min(img.naturalWidth, img.naturalHeight, 50); // Small sample for faster comparison
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  ctx.drawImage(img, 0, 0, size, size);
  return canvas.toDataURL('image/jpeg', 0.1); // Low quality for smaller hash
};

/**
 * Compare image hash to detect duplicates
 */
export const isDuplicateImage = (
  url: string, 
  img: HTMLImageElement, 
  existingHashes: Map<string, string>
): boolean => {
  if (!url || !img) return false;
  
  const hash = generateImageHash(img);
  
  for (const [existingUrl, existingHash] of existingHashes.entries()) {
    if (existingHash === hash && existingUrl !== url) {
      Logger.warn(`Duplicate image detected: ${url.substring(0, 30)}... matches ${existingUrl.substring(0, 30)}...`);
      return true;
    }
  }
  
  existingHashes.set(url, hash);
  return false;
};

/**
 * Preload image and return it as an HTMLImageElement
 */
export const preloadImage = (
  url: string, 
  onSuccess: (img: HTMLImageElement) => void,
  onError: () => void,
  imageCacheRef: Map<string, boolean>,
  preloadedImagesRef: Map<string, HTMLImageElement>
): void => {
  if (imageCacheRef.has(url) || preloadedImagesRef.has(url)) {
    const cachedImg = preloadedImagesRef.get(url);
    if (cachedImg && onSuccess) {
      onSuccess(cachedImg);
    }
    return;
  }
  
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    imageCacheRef.set(url, true);
    preloadedImagesRef.set(url, img);
    
    if (onSuccess) {
      onSuccess(img);
    }
    
    Logger.info(`Preloaded image: ${url.substring(0, 50)}...`);
  };
  img.onerror = () => {
    Logger.warn(`Failed to preload image: ${url.substring(0, 50)}...`);
    if (onError) {
      onError();
    }
  };
  img.src = url;
};
