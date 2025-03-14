
import { useEffect } from "react";
import { useImageLoader } from "./useImageLoader";
import { useImageNavigation } from "./useImageNavigation";
import { useImageProcessing } from "./useImageProcessing";
import { Logger } from "@/utils/logger";

interface AdImageHandlerProps {
  onImageChange?: (urls: string[]) => void;
  onCurrentIndexChange?: (index: number) => void;
  onImageChangeConfirmed?: () => void;
}

export function useAdImageHandler({ 
  onImageChange, 
  onCurrentIndexChange,
  onImageChangeConfirmed
}: AdImageHandlerProps = {}) {
  const {
    selectedImages,
    imageUrls,
    handleImageChange,
    handleImageUrlsChange,
    preloadImage,
    getPreloadedImage,
    setImageUrls
  } = useImageLoader({
    onImageChange
  });
  
  const {
    currentPreviewIndex,
    setCurrentPreviewIndex,
    setCurrentPreviewIndexSafely,
    handlePrevPreview: baseHandlePrevPreview,
    handleNextPreview: baseHandleNextPreview,
    confirmImageChanged,
    isChangingIndex,
    imageChangeConfirmed
  } = useImageNavigation({
    onCurrentIndexChange,
    onImageChangeConfirmed
  });
  
  const {
    markIndexProcessed,
    isIndexProcessed,
    resetProcessedIndexes,
    getUnprocessedIndexes
  } = useImageProcessing();

  // Create handlers that use the imageUrls.length
  const handlePrevPreview = () => baseHandlePrevPreview(imageUrls.length);
  const handleNextPreview = () => baseHandleNextPreview(imageUrls.length);

  // Preload images when they change
  useEffect(() => {
    if (imageUrls.length > 0) {
      // Always preload the current image
      preloadImage(imageUrls[currentPreviewIndex]);
      
      // Preload next few images
      for (let i = 1; i <= 2; i++) {
        if (currentPreviewIndex + i < imageUrls.length) {
          preloadImage(imageUrls[currentPreviewIndex + i]);
        }
      }
      
      // Preload previous images
      for (let i = 1; i <= 2; i++) {
        if (currentPreviewIndex - i >= 0) {
          preloadImage(imageUrls[currentPreviewIndex - i]);
        }
      }
    }
  }, [currentPreviewIndex, imageUrls]);

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
    getUnprocessedIndexes: () => getUnprocessedIndexes(imageUrls.length),
    isChangingIndex,
    confirmImageChanged,
    preloadImage,
    getPreloadedImage
  };
}
