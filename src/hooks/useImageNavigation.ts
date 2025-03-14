
import { useState, useRef } from "react";
import { Logger } from "@/utils/logger";

interface UseImageNavigationProps {
  onCurrentIndexChange?: (index: number) => void;
  onImageChangeConfirmed?: () => void;
}

export function useImageNavigation({ 
  onCurrentIndexChange,
  onImageChangeConfirmed
}: UseImageNavigationProps = {}) {
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const isChangingIndex = useRef<boolean>(false);
  const previousIndex = useRef<number>(0);
  const lastImageLoadTime = useRef<number>(0);
  const imageChangeConfirmed = useRef<boolean>(false);
  
  const handlePrevPreview = (imageUrlsLength: number) => {
    if (imageUrlsLength === 0 || isChangingIndex.current) return;
    
    isChangingIndex.current = true;
    const newIndex = currentPreviewIndex > 0 ? currentPreviewIndex - 1 : imageUrlsLength - 1;
    
    Logger.info(`Navigating to previous image, from ${currentPreviewIndex} to ${newIndex}`);
    setCurrentPreviewIndex(newIndex);
    previousIndex.current = newIndex;
    if (onCurrentIndexChange) {
      onCurrentIndexChange(newIndex);
    }
    
    setTimeout(() => {
      isChangingIndex.current = false;
    }, 150);
  };

  const handleNextPreview = (imageUrlsLength: number) => {
    if (imageUrlsLength === 0 || isChangingIndex.current) return;
    
    isChangingIndex.current = true;
    const newIndex = currentPreviewIndex < imageUrlsLength - 1 ? currentPreviewIndex + 1 : 0;
    
    Logger.info(`Navigating to next image, from ${currentPreviewIndex} to ${newIndex}`);
    setCurrentPreviewIndex(newIndex);
    previousIndex.current = newIndex;
    if (onCurrentIndexChange) {
      onCurrentIndexChange(newIndex);
    }
    
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
        if (onCurrentIndexChange) {
          onCurrentIndexChange(index);
        }
        
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

  const confirmImageChanged = () => {
    if (onImageChangeConfirmed) {
      onImageChangeConfirmed();
    }
    imageChangeConfirmed.current = true;
    lastImageLoadTime.current = Date.now();
    Logger.info(`Image change confirmed at ${lastImageLoadTime.current}`);
  };

  return {
    currentPreviewIndex,
    setCurrentPreviewIndex,
    setCurrentPreviewIndexSafely,
    handlePrevPreview,
    handleNextPreview,
    confirmImageChanged,
    isChangingIndex: () => isChangingIndex.current,
    imageChangeConfirmed: () => imageChangeConfirmed.current
  };
}
