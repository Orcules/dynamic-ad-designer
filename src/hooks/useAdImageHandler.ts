
import { useState, useRef, useEffect } from "react";
import { Logger } from "@/utils/logger";
import { useImageNavigation } from "./useImageNavigation";
import { useImageTracking } from "./useImageTracking";
import { useImagePreloading } from "./useImagePreloading";

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
  const lastImageLoadTime = useRef<number>(0);
  const imageChangeConfirmed = useRef<boolean>(false);
  const imageChangeInProgress = useRef<boolean>(false);
  
  // Use our extracted hooks
  const { preloadImage, getPreloadedImage, preloadedImagesRef } = useImagePreloading();
  
  const { 
    currentPreviewIndex, 
    handlePrevPreview, 
    handleNextPreview, 
    setCurrentPreviewIndex,
    setCurrentPreviewIndexSafely,
    confirmImageChanged,
    isChangingIndex,
    isNavigationLocked
  } = useImageNavigation({
    imageUrls,
    onCurrentIndexChange,
    onImageChangeConfirmed: () => {
      if (onImageChangeConfirmed) {
        onImageChangeConfirmed();
      }
      imageChangeConfirmed.current = true;
      imageChangeInProgress.current = false;
      lastImageLoadTime.current = Date.now();
      Logger.info(`Image change confirmed at ${lastImageLoadTime.current}`);
    }
  });
  
  const {
    markIndexProcessed,
    isIndexProcessed,
    isImageUrlProcessed,
    resetProcessedIndexes,
    getUnprocessedIndexes,
    detectDuplicateImages,
    processedImageUrls
  } = useImageTracking();

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
      
      resetProcessedIndexes();
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
      
      setImageUrls(uniqueUrls);
      // Make sure current index is valid
      const safeIndex = uniqueUrls.length > 0 ? 0 : 0;
      setCurrentPreviewIndex(safeIndex);
      
      // Communicate changes to parent components
      onImageChange(uniqueUrls);
      onCurrentIndexChange(safeIndex);
      
      resetProcessedIndexes();
    } catch (error) {
      Logger.error(`Error in handleImageUrlsChange: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Run duplicate detection when images are loaded
  useEffect(() => {
    if (imageUrls.length > 1 && preloadedImagesRef.size >= imageUrls.length) {
      const timer = setTimeout(() => {
        const duplicates = detectDuplicateImages(imageUrls, preloadedImagesRef);
        Logger.info(`Found ${duplicates.length} duplicate images`);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [imageUrls.length, preloadedImagesRef.size]);

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
    markIndexProcessed: (index: number) => markIndexProcessed(index, imageUrls),
    isIndexProcessed,
    isImageUrlProcessed,
    resetProcessedIndexes,
    getUnprocessedIndexes: () => getUnprocessedIndexes(imageUrls),
    isChangingIndex,
    confirmImageChanged,
    preloadImage,
    getPreloadedImage,
    detectDuplicateImages: () => detectDuplicateImages(imageUrls, preloadedImagesRef),
    isNavigationLocked
  };
}
