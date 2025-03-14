
import { useState, useRef, useEffect } from "react";
import { Logger } from "@/utils/logger";

interface AdImageHandlerProps {
  onImageChange: (urls: string[]) => void;
  onCurrentIndexChange: (index: number) => void;
  onImageChangeConfirmed?: () => void;
}

export function useAdImageHandler({ 
  onImageChange, 
  onCurrentIndexChange,
  onImageChangeConfirmed
}: AdImageHandlerProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const processedIndexes = useRef<Set<number>>(new Set());
  const processedImageUrls = useRef<Set<string>>(new Set()); // Track processed image URLs
  const uniqueImageHashes = useRef<Map<string, string>>(new Map()); // Store image hashes to prevent duplicates
  const isChangingIndex = useRef<boolean>(false);
  const previousIndex = useRef<number>(0);
  const lastImageLoadTime = useRef<number>(0);
  const imageCacheRef = useRef<Map<string, boolean>>(new Map());
  const preloadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const imageChangeConfirmed = useRef<boolean>(false);
  const imageChangeInProgress = useRef<boolean>(false);
  const imageNavigationLock = useRef<boolean>(false);
  const pendingIndexChangeRef = useRef<number | null>(null);
  const indexChangeAttemptCount = useRef<number>(0);
  
  const generateImageHash = (img: HTMLImageElement): string => {
    const canvas = document.createElement('canvas');
    const size = Math.min(img.naturalWidth, img.naturalHeight, 50); // Small sample for faster comparison
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    ctx.drawImage(img, 0, 0, size, size);
    return canvas.toDataURL('image/jpeg', 0.1); // Low quality for smaller hash
  };
  
  const isDuplicateImage = (url: string, img: HTMLImageElement): boolean => {
    if (!url || !img) return false;
    
    const hash = generateImageHash(img);
    
    for (const [existingUrl, existingHash] of uniqueImageHashes.current.entries()) {
      if (existingHash === hash && existingUrl !== url) {
        Logger.warn(`Duplicate image detected: ${url.substring(0, 30)}... matches ${existingUrl.substring(0, 30)}...`);
        return true;
      }
    }
    
    uniqueImageHashes.current.set(url, hash);
    return false;
  };
  
  const preloadImage = (url: string) => {
    if (imageCacheRef.current.has(url) || preloadedImagesRef.current.has(url)) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCacheRef.current.set(url, true);
      preloadedImagesRef.current.set(url, img);
      
      if (isDuplicateImage(url, img)) {
        Logger.warn(`Image ${url.substring(0, 30)}... will be flagged as a duplicate`);
        processedImageUrls.current.add(url);
      }
      
      Logger.info(`Preloaded image: ${url.substring(0, 50)}...`);
    };
    img.onerror = () => {
      Logger.warn(`Failed to preload image: ${url.substring(0, 50)}...`);
    };
    img.src = url;
  };

  const confirmImageChanged = () => {
    if (onImageChangeConfirmed) {
      onImageChangeConfirmed();
    }
    imageChangeConfirmed.current = true;
    imageChangeInProgress.current = false;
    lastImageLoadTime.current = Date.now();
    Logger.info(`Image change confirmed at ${lastImageLoadTime.current}`);
    
    // Process pending index changes if any
    if (pendingIndexChangeRef.current !== null && 
        pendingIndexChangeRef.current !== currentPreviewIndex) {
      const targetIndex = pendingIndexChangeRef.current;
      pendingIndexChangeRef.current = null;
      
      // Delay slightly to ensure UI is updated
      setTimeout(() => {
        setCurrentPreviewIndexSafely(targetIndex, 3);
      }, 200);
    } else {
      // Release navigation lock after a short delay to ensure rendering is complete
      setTimeout(() => {
        imageNavigationLock.current = false;
        Logger.info("Navigation lock released");
      }, 200);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/') && file.size > 0
      );
      
      if (files.length === 0) {
        Logger.warn('No valid image files selected');
        return;
      }
      
      setSelectedImages(prev => [...prev, ...files]);
      
      const urls = files.map(file => {
        const url = URL.createObjectURL(file);
        preloadImage(url);
        return url;
      });
      
      const uniqueUrls = urls.filter(url => !imageUrls.includes(url));
      
      Logger.info(`Adding ${uniqueUrls.length} new image URLs (from ${urls.length} total)`);
      
      setImageUrls(prevUrls => {
        const newUrls = [...prevUrls, ...uniqueUrls];
        onImageChange(newUrls);
        return newUrls;
      });
      
      if (imageUrls.length === 0 && uniqueUrls.length > 0) {
        setCurrentPreviewIndex(0);
        onCurrentIndexChange(0);
      }
      
      processedIndexes.current = new Set();
      processedImageUrls.current = new Set();
    }
  };

  const handleImageUrlsChange = (urls: string[]) => {
    try {
      const validUrls = urls.filter(url => url && url.trim() !== '' && url !== 'undefined');
      
      if (validUrls.length === 0) {
        Logger.warn('No valid image URLs provided');
        return;
      }
      
      const secureUrls = validUrls.map(url => {
        if (url.startsWith('http:') && !url.includes('localhost')) {
          return url.replace(/^http:/, 'https:');
        }
        return url;
      });
      
      const uniqueUrls = Array.from(new Set(secureUrls));
      Logger.info(`Deduplicating URLs: ${secureUrls.length} -> ${uniqueUrls.length}`);
      
      // Preload all images
      uniqueUrls.forEach(url => preloadImage(url));
      
      // Reset index tracking
      imageNavigationLock.current = false;
      isChangingIndex.current = false;
      
      setImageUrls(uniqueUrls);
      // Make sure current index is valid
      const safeIndex = uniqueUrls.length > 0 ? 0 : 0;
      setCurrentPreviewIndex(safeIndex);
      previousIndex.current = safeIndex;
      
      // Communicate changes to parent components
      onImageChange(uniqueUrls);
      onCurrentIndexChange(safeIndex);
      
      processedIndexes.current = new Set();
      processedImageUrls.current = new Set();
      uniqueImageHashes.current.clear();
    } catch (error) {
      Logger.error(`Error in handleImageUrlsChange: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handlePrevPreview = () => {
    if (imageUrls.length === 0 || isChangingIndex.current || imageNavigationLock.current) {
      Logger.info("Navigation skipped: " + (isChangingIndex.current ? "change in progress" : 
                                           imageNavigationLock.current ? "navigation locked" : 
                                           "no images"));
      return;
    }
    
    isChangingIndex.current = true;
    imageNavigationLock.current = true;
    imageChangeInProgress.current = true;
    imageChangeConfirmed.current = false;
    
    Logger.info("Navigation: Previous");
    const newIndex = currentPreviewIndex > 0 ? currentPreviewIndex - 1 : imageUrls.length - 1;
    
    setCurrentPreviewIndex(newIndex);
    previousIndex.current = currentPreviewIndex;
    onCurrentIndexChange(newIndex);
    
    // Use a longer timeout for navigation lock to ensure image loads properly
    setTimeout(() => {
      isChangingIndex.current = false;
      
      // Navigation lock will be released when image load is confirmed
      if (!imageChangeConfirmed.current) {
        setTimeout(() => {
          imageNavigationLock.current = false;
          Logger.info("Navigation lock timeout expired");
        }, 1000);
      }
    }, 300);
  };

  const handleNextPreview = () => {
    if (imageUrls.length === 0 || isChangingIndex.current || imageNavigationLock.current) {
      Logger.info("Navigation skipped: " + (isChangingIndex.current ? "change in progress" : 
                                           imageNavigationLock.current ? "navigation locked" : 
                                           "no images"));
      return;
    }
    
    isChangingIndex.current = true;
    imageNavigationLock.current = true;
    imageChangeInProgress.current = true;
    imageChangeConfirmed.current = false;
    
    Logger.info("Navigation: Next");
    const newIndex = currentPreviewIndex < imageUrls.length - 1 ? currentPreviewIndex + 1 : 0;
    
    setCurrentPreviewIndex(newIndex);
    previousIndex.current = currentPreviewIndex;
    onCurrentIndexChange(newIndex);
    
    // Use a longer timeout for navigation lock to ensure image loads properly
    setTimeout(() => {
      isChangingIndex.current = false;
      
      // Navigation lock will be released when image load is confirmed
      if (!imageChangeConfirmed.current) {
        setTimeout(() => {
          imageNavigationLock.current = false;
          Logger.info("Navigation lock timeout expired");
        }, 1000);
      }
    }, 300);
  };

  const setCurrentPreviewIndexSafely = async (index: number, maxRetries = 3): Promise<boolean> => {
    Logger.info(`Ensuring preview index is set to ${index}, current: ${currentPreviewIndex}`);
    
    // Input validation - guard against invalid indexes
    if (index < 0 || index >= imageUrls.length) {
      Logger.warn(`Invalid preview index ${index}, valid range is 0-${imageUrls.length - 1}`);
      if (imageUrls.length > 0) {
        index = Math.min(Math.max(0, index), imageUrls.length - 1);
      } else {
        Logger.error('Cannot set preview index: no images available');
        return false;
      }
    }
    
    // Store the target index in case we need to retry after other operations complete
    pendingIndexChangeRef.current = index;
    
    // If locked, wait for it to be released
    if (isChangingIndex.current || imageNavigationLock.current) {
      Logger.info(`Waiting for ongoing index change/navigation lock to complete before setting to ${index}`);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (isChangingIndex.current || imageNavigationLock.current) {
        Logger.info(`Still waiting for lock release...`);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
    
    if (index >= 0 && index < imageUrls.length) {
      const url = imageUrls[index];
      const isImageDuplicate = processedImageUrls.current.has(url);
      
      if (isImageDuplicate) {
        Logger.warn(`Skipping duplicate image at index ${index}: ${url.substring(0, 30)}...`);
        
        if (index < imageUrls.length - 1) {
          return setCurrentPreviewIndexSafely(index + 1, maxRetries);
        } else if (index > 0) {
          return setCurrentPreviewIndexSafely(index - 1, maxRetries);
        }
        
        Logger.warn("All images appear to be duplicates, proceeding with the current one");
      }
    }
    
    if (currentPreviewIndex === index) {
      if (imageChangeConfirmed.current) {
        Logger.info(`Preview index is already ${index} and image is confirmed`);
        pendingIndexChangeRef.current = null;
        return true;
      } else {
        Logger.info(`Preview index is ${index} but image change not confirmed yet`);
        imageChangeConfirmed.current = false;
        imageChangeInProgress.current = true;
      }
    }
    
    let success = false;
    let attempts = 0;
    
    while (!success && attempts < maxRetries) {
      attempts++;
      Logger.info(`Attempt ${attempts}/${maxRetries} to set preview index to ${index}`);
      
      // Reset any existing flags to ensure a clean state for this attempt
      imageChangeConfirmed.current = false;
      imageChangeInProgress.current = true;
      isChangingIndex.current = true;
      imageNavigationLock.current = true;
      
      success = await new Promise<boolean>(resolve => {
        // Log the state change to help track issues
        Logger.info(JSON.stringify({
          message: "Current index changed",
          index: index
        }));
        
        // Update the state and trigger the callback
        setCurrentPreviewIndex(index);
        previousIndex.current = currentPreviewIndex;
        onCurrentIndexChange(index);
        
        // Give time for the state to update before proceeding
        setTimeout(() => {
          Logger.info(`Index set to ${index}`);
          isChangingIndex.current = false;
          resolve(true);
        }, 400);
      });
      
      if (success) {
        Logger.info(`Successfully set preview index to ${index} on attempt ${attempts}`);
        
        // Wait for image change confirmation
        let confirmed = await new Promise<boolean>(resolve => {
          const checkInterval = setInterval(() => {
            if (imageChangeConfirmed.current) {
              clearInterval(checkInterval);
              resolve(true);
            }
          }, 100);
          
          setTimeout(() => {
            clearInterval(checkInterval);
            resolve(false);
          }, 2000);
        });
        
        if (!confirmed) {
          Logger.warn(`Image change not confirmed for index ${index} within timeout, forcing confirmation`);
          confirmImageChanged();
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        Logger.info(`Image change confirmed: ${imageChangeConfirmed.current}`);
        pendingIndexChangeRef.current = null;
        return true;
      }
      
      if (attempts < maxRetries) {
        Logger.warn(`Failed to set preview index to ${index}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (!success) {
      Logger.error(`Failed to set preview index to ${index} after ${maxRetries} attempts`);
      imageNavigationLock.current = false; // Release lock in case of failure
      
      // Force a final attempt with direct state update
      if (indexChangeAttemptCount.current < 2) {
        indexChangeAttemptCount.current++;
        setCurrentPreviewIndex(index);
        onCurrentIndexChange(index);
        
        // Wait a bit and check if it worked
        await new Promise(resolve => setTimeout(resolve, 500));
        if (currentPreviewIndex === index) {
          Logger.info(`Index finally set to ${index} after all attempts`);
          pendingIndexChangeRef.current = null;
          return true;
        }
      }
    }
    
    pendingIndexChangeRef.current = null;
    return success;
  };

  const getPreloadedImage = (url: string): HTMLImageElement | null => {
    return preloadedImagesRef.current.get(url) || null;
  };

  const markIndexProcessed = (index: number) => {
    if (index < 0 || index >= imageUrls.length) {
      Logger.warn(`Cannot mark invalid index ${index} as processed (valid range: 0-${imageUrls.length - 1})`);
      return;
    }
    
    processedIndexes.current.add(index);
    
    if (index >= 0 && index < imageUrls.length) {
      processedImageUrls.current.add(imageUrls[index]);
      
      const url = imageUrls[index];
      const img = preloadedImagesRef.current.get(url);
      
      if (img) {
        const isDuplicate = isDuplicateImage(url, img);
        if (isDuplicate) {
          Logger.warn(`Marked visually duplicate image at index ${index} as processed`);
        }
      }
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

  const getUnprocessedIndexes = (): number[] => {
    return Array.from({ length: imageUrls.length }, (_, i) => i)
      .filter(i => !processedIndexes.current.has(i));
  };

  const detectDuplicateImages = () => {
    Logger.info("Checking for duplicate images in current image set");
    const duplicateIndexes: number[] = [];
    
    imageUrls.forEach((url, index) => {
      const img = preloadedImagesRef.current.get(url);
      if (img) {
        if (!uniqueImageHashes.current.has(url)) {
          uniqueImageHashes.current.set(url, generateImageHash(img));
        }
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

  useEffect(() => {
    if (imageUrls.length > 1 && preloadedImagesRef.current.size >= imageUrls.length) {
      const timer = setTimeout(() => {
        const duplicates = detectDuplicateImages();
        Logger.info(`Found ${duplicates.length} duplicate images`);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [imageUrls.length, preloadedImagesRef.current.size]);

  // Clean up memory when component unmounts
  useEffect(() => {
    return () => {
      // Clean up blob URLs to prevent memory leaks
      imageUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(url);
          } catch (e) {
            // Ignore errors when revoking URLs
          }
        }
      });
      
      // Clear caches
      imageCacheRef.current.clear();
      preloadedImagesRef.current.clear();
      uniqueImageHashes.current.clear();
    };
  }, []);

  return {
    selectedImages,
    imageUrls,
    currentPreviewIndex,
    handleImageChange,
    handleImageUrlsChange,
    handlePrevPreview,
    handleNextPreview,
    setCurrentPreviewIndex,
    setCurrentPreviewIndexSafely,
    markIndexProcessed,
    isIndexProcessed,
    isImageUrlProcessed,
    resetProcessedIndexes,
    getUnprocessedIndexes,
    isChangingIndex: () => isChangingIndex.current || imageNavigationLock.current,
    confirmImageChanged,
    preloadImage,
    getPreloadedImage,
    detectDuplicateImages,
    isNavigationLocked: () => imageNavigationLock.current
  };
}
