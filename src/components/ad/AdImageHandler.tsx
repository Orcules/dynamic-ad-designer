
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
  const isChangingIndex = useRef<boolean>(false);
  const previousIndex = useRef<number>(0);
  const lastImageLoadTime = useRef<number>(0);
  const imageCacheRef = useRef<Map<string, boolean>>(new Map());
  const preloadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const imageChangeConfirmed = useRef<boolean>(false);
  
  const preloadImage = (url: string) => {
    if (imageCacheRef.current.has(url) || preloadedImagesRef.current.has(url)) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCacheRef.current.set(url, true);
      preloadedImagesRef.current.set(url, img);
      Logger.info(`Preloaded image: ${url.substring(0, 50)}...`);
    };
    img.src = url;
  };

  useEffect(() => {
    if (previousIndex.current !== currentPreviewIndex) {
      previousIndex.current = currentPreviewIndex;
      Logger.info(`Index changed from effect: ${currentPreviewIndex}`);
    }
    
    if (imageUrls.length > 0) {
      preloadImage(imageUrls[currentPreviewIndex]);
      
      for (let i = 1; i <= 2; i++) {
        if (currentPreviewIndex + i < imageUrls.length) {
          preloadImage(imageUrls[currentPreviewIndex + i]);
        }
      }
      
      for (let i = 1; i <= 2; i++) {
        if (currentPreviewIndex - i >= 0) {
          preloadImage(imageUrls[currentPreviewIndex - i]);
        }
      }
    }
  }, [currentPreviewIndex, imageUrls]);

  const confirmImageChanged = () => {
    if (onImageChangeConfirmed) {
      onImageChangeConfirmed();
    }
    imageChangeConfirmed.current = true;
    lastImageLoadTime.current = Date.now();
    Logger.info(`Image change confirmed at ${lastImageLoadTime.current}`);
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
      
      setImageUrls(prevUrls => {
        const newUrls = [...prevUrls, ...urls];
        setTimeout(() => onImageChange(newUrls), 0);
        return newUrls;
      });
      
      if (imageUrls.length === 0) {
        setCurrentPreviewIndex(0);
        onCurrentIndexChange(0);
      }
      
      processedIndexes.current = new Set();
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
      
      Promise.all(secureUrls.map(url => {
        preloadImage(url);
        return new Promise<void>((resolve) => {
          setTimeout(resolve, 50);
        });
      }));
      
      setImageUrls(secureUrls);
      setCurrentPreviewIndex(0);
      previousIndex.current = 0;
      onImageChange(secureUrls);
      onCurrentIndexChange(0);
      
      processedIndexes.current = new Set();
    } catch (error) {
      Logger.error(`Error in handleImageUrlsChange: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handlePrevPreview = () => {
    if (imageUrls.length === 0 || isChangingIndex.current) return;
    
    isChangingIndex.current = true;
    const newIndex = currentPreviewIndex > 0 ? currentPreviewIndex - 1 : imageUrls.length - 1;
    
    setCurrentPreviewIndex(newIndex);
    previousIndex.current = newIndex;
    onCurrentIndexChange(newIndex);
    
    setTimeout(() => {
      isChangingIndex.current = false;
    }, 150);
  };

  const handleNextPreview = () => {
    if (imageUrls.length === 0 || isChangingIndex.current) return;
    
    isChangingIndex.current = true;
    const newIndex = currentPreviewIndex < imageUrls.length - 1 ? currentPreviewIndex + 1 : 0;
    
    setCurrentPreviewIndex(newIndex);
    previousIndex.current = newIndex;
    onCurrentIndexChange(newIndex);
    
    setTimeout(() => {
      isChangingIndex.current = false;
    }, 150);
  };

  const setCurrentPreviewIndexSafely = async (index: number, maxRetries = 3): Promise<boolean> => {
    Logger.info(`Ensuring preview index is set to ${index}, current: ${currentPreviewIndex}`);
    
    if (currentPreviewIndex === index && !isChangingIndex.current) {
      if (imageChangeConfirmed.current) {
        Logger.info(`Preview index is already ${index} and image is confirmed`);
        return true;
      } else {
        Logger.info(`Preview index is ${index} but image change not confirmed yet`);
      }
    }
    
    if (isChangingIndex.current) {
      Logger.info(`Waiting for ongoing index change to complete before setting to ${index}`);
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    let success = false;
    let attempts = 0;
    
    while (!success && attempts < maxRetries) {
      attempts++;
      Logger.info(`Attempt ${attempts}/${maxRetries} to set preview index to ${index}`);
      
      imageChangeConfirmed.current = false;
      
      success = await new Promise<boolean>(resolve => {
        setCurrentPreviewIndex(index);
        previousIndex.current = index;
        onCurrentIndexChange(index);
        
        setTimeout(() => {
          Logger.info(`Index safely changed to ${index}`);
          isChangingIndex.current = false;
          resolve(true);
        }, 250);
      });
      
      if (success) {
        Logger.info(`Successfully set preview index to ${index} on attempt ${attempts}`);
        
        await new Promise(resolve => {
          const checkInterval = setInterval(() => {
            if (imageChangeConfirmed.current) {
              clearInterval(checkInterval);
              resolve(true);
            }
          }, 100);
          
          setTimeout(() => {
            clearInterval(checkInterval);
            resolve(false);
          }, 1500);
        });
        
        Logger.info(`Image change confirmed: ${imageChangeConfirmed.current}`);
        return true;
      }
      
      if (attempts < maxRetries) {
        Logger.warn(`Failed to set preview index to ${index}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }
    
    if (!success) {
      Logger.error(`Failed to set preview index to ${index} after ${maxRetries} attempts`);
    }
    
    return success;
  };

  const getPreloadedImage = (url: string): HTMLImageElement | null => {
    return preloadedImagesRef.current.get(url) || null;
  };

  const markIndexProcessed = (index: number) => {
    processedIndexes.current.add(index);
    Logger.info(`Marked index ${index} as processed. Total processed: ${processedIndexes.current.size}/${imageUrls.length}`);
  };

  const isIndexProcessed = (index: number): boolean => {
    return processedIndexes.current.has(index);
  };

  const resetProcessedIndexes = () => {
    processedIndexes.current = new Set();
    Logger.info("Reset processed indexes");
  };

  const getUnprocessedIndexes = (): number[] => {
    return Array.from({ length: imageUrls.length }, (_, i) => i)
      .filter(i => !processedIndexes.current.has(i));
  };

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
    resetProcessedIndexes,
    getUnprocessedIndexes,
    isChangingIndex: () => isChangingIndex.current,
    confirmImageChanged,
    preloadImage,
    getPreloadedImage
  };
}
