
import { Logger } from "@/utils/logger";

/**
 * Generate a simple hash for an image to detect duplicates
 */
export const generateImageHash = (img: HTMLImageElement): string => {
  try {
    if (!img || !img.naturalWidth || !img.naturalHeight || typeof document === 'undefined') {
      return '';
    }
    
    const canvas = document.createElement('canvas');
    const size = Math.min(img.naturalWidth || 50, img.naturalHeight || 50, 50); // Small sample for faster comparison
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      Logger.warn("Failed to get 2D context for image hashing");
      return '';
    }
    
    try {
      ctx.drawImage(img, 0, 0, size, size);
      return canvas.toDataURL('image/jpeg', 0.1); // Low quality for smaller hash
    } catch (drawError) {
      Logger.error(`Error drawing image to canvas: ${drawError}`);
      return '';
    }
  } catch (error) {
    Logger.error(`Error generating image hash: ${error}`);
    return '';
  }
};

/**
 * Compare image hash to detect duplicates
 */
export const isDuplicateImage = (
  url: string, 
  img: HTMLImageElement, 
  existingHashes: Map<string, string>
): boolean => {
  try {
    if (!url || !img || typeof document === 'undefined') return false;
    if (!existingHashes) {
      Logger.warn("existingHashes map is null or undefined");
      return false;
    }
    
    const hash = generateImageHash(img);
    if (!hash) return false;
    
    for (const [existingUrl, existingHash] of existingHashes.entries()) {
      if (existingHash === hash && existingUrl !== url) {
        Logger.warn(`Duplicate image detected: ${url.substring(0, 30)}... matches ${existingUrl.substring(0, 30)}...`);
        return true;
      }
    }
    
    existingHashes.set(url, hash);
    return false;
  } catch (error) {
    Logger.error(`Error in isDuplicateImage: ${error}`);
    return false;
  }
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
  try {
    if (!url || typeof window === 'undefined') {
      if (onError) onError();
      return;
    }

    // Check if both cache maps exist
    if (!imageCacheRef || !preloadedImagesRef) {
      Logger.error("Image cache references are invalid");
      if (onError) onError();
      return;
    }

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
      try {
        imageCacheRef.set(url, true);
        preloadedImagesRef.set(url, img);
        
        if (onSuccess) {
          onSuccess(img);
        }
        
        Logger.info(`Preloaded image: ${url.substring(0, 50)}...`);
      } catch (loadError) {
        Logger.error(`Error in image onload handler: ${loadError}`);
        if (onError) onError();
      }
    };
    
    img.onerror = () => {
      Logger.warn(`Failed to preload image: ${url.substring(0, 50)}...`);
      if (onError) {
        onError();
      }
    };
    
    img.src = url;
  } catch (error) {
    Logger.error(`Error in preloadImage: ${error}`);
    if (onError) onError();
  }
};
