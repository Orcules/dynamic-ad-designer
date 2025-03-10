
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
  
  // Preload images for faster rendering
  const preloadImage = (url: string) => {
    if (imageCacheRef.current.has(url)) return;
    
    const img = new Image();
    img.onload = () => {
      imageCacheRef.current.set(url, true);
    };
    img.src = url;
  };

  useEffect(() => {
    // Track when the preview index changes to allow detection of actual image changes
    if (previousIndex.current !== currentPreviewIndex) {
      previousIndex.current = currentPreviewIndex;
      Logger.info(`Index changed from effect: ${currentPreviewIndex}`);
    }
    
    // Preload adjacent images to make navigation faster
    if (imageUrls.length > 0) {
      // Preload current image
      preloadImage(imageUrls[currentPreviewIndex]);
      
      // Preload next image if it exists
      if (currentPreviewIndex < imageUrls.length - 1) {
        preloadImage(imageUrls[currentPreviewIndex + 1]);
      }
      
      // Preload previous image if it exists
      if (currentPreviewIndex > 0) {
        preloadImage(imageUrls[currentPreviewIndex - 1]);
      }
    }
  }, [currentPreviewIndex, imageUrls]);

  const confirmImageChanged = () => {
    if (onImageChangeConfirmed) {
      onImageChangeConfirmed();
    }
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
      
      // Create temporary URLs and preload images for faster rendering
      const urls = files.map(file => {
        const url = URL.createObjectURL(file);
        preloadImage(url);
        return url;
      });
      
      // Safely update state
      setImageUrls(prevUrls => {
        const newUrls = [...prevUrls, ...urls];
        // Call callback after update
        setTimeout(() => onImageChange(newUrls), 0);
        return newUrls;
      });
      
      // Update current index to first new image
      if (imageUrls.length === 0) {
        setCurrentPreviewIndex(0);
        onCurrentIndexChange(0);
      }
      
      // Reset processed indexes when adding new images
      processedIndexes.current = new Set();
    }
  };

  const handleImageUrlsChange = (urls: string[]) => {
    try {
      // Filter out empty or invalid URLs
      const validUrls = urls.filter(url => url && url.trim() !== '' && url !== 'undefined');
      
      if (validUrls.length === 0) {
        Logger.warn('No valid image URLs provided');
        return;
      }
      
      // Ensure all URLs are HTTPS (if not specifically required HTTP)
      const secureUrls = validUrls.map(url => {
        if (url.startsWith('http:') && !url.includes('localhost')) {
          return url.replace(/^http:/, 'https:');
        }
        return url;
      });
      
      // Preload all images for faster rendering
      secureUrls.forEach(url => preloadImage(url));
      
      setImageUrls(secureUrls);
      setCurrentPreviewIndex(0);
      previousIndex.current = 0;
      onImageChange(secureUrls);
      onCurrentIndexChange(0);
      
      // Reset processed indexes when changing image URLs
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
    
    // Shorter timeout for faster navigation
    setTimeout(() => {
      isChangingIndex.current = false;
    }, 300);
  };

  const handleNextPreview = () => {
    if (imageUrls.length === 0 || isChangingIndex.current) return;
    
    isChangingIndex.current = true;
    const newIndex = currentPreviewIndex < imageUrls.length - 1 ? currentPreviewIndex + 1 : 0;
    
    setCurrentPreviewIndex(newIndex);
    previousIndex.current = newIndex;
    onCurrentIndexChange(newIndex);
    
    // Shorter timeout for faster navigation
    setTimeout(() => {
      isChangingIndex.current = false;
    }, 300);
  };

  // Method to safely set current preview index with confirmation
  const setCurrentPreviewIndexSafely = async (index: number): Promise<boolean> => {
    if (index < 0 || index >= imageUrls.length) {
      Logger.error(`Invalid index ${index}, must be between 0 and ${imageUrls.length - 1}`);
      return false;
    }
    
    // Don't change if we're already at that index and not currently changing
    if (currentPreviewIndex === index && !isChangingIndex.current) {
      Logger.info(`Already at index ${index}, no change needed`);
      return true;
    }
    
    // Track that we're changing the index to prevent other changes
    isChangingIndex.current = true;
    
    // Set the new index
    Logger.info(`Setting index to ${index} from ${currentPreviewIndex}`);
    setCurrentPreviewIndex(index);
    previousIndex.current = index;
    onCurrentIndexChange(index);
    
    // Wait for the state to update - use a shorter timeout for faster processing
    return new Promise((resolve) => {
      setTimeout(() => {
        Logger.info(`Index safely changed to ${index}`);
        isChangingIndex.current = false;
        resolve(true);
      }, 500); // Shorter delay for faster processing
    });
  };

  // Method to mark an index as processed
  const markIndexProcessed = (index: number) => {
    processedIndexes.current.add(index);
    Logger.info(`Marked index ${index} as processed. Total processed: ${processedIndexes.current.size}/${imageUrls.length}`);
  };

  // Method to check if an index has been processed
  const isIndexProcessed = (index: number): boolean => {
    return processedIndexes.current.has(index);
  };

  // Method to reset processed indexes
  const resetProcessedIndexes = () => {
    processedIndexes.current = new Set();
    Logger.info("Reset processed indexes");
  };

  // Get all unprocessed indexes
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
    preloadImage // Expose preload function
  };
}
