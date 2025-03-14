
import { useState, useRef, useEffect } from "react";
import { Logger } from "@/utils/logger";

interface UseImageNavigationProps {
  imageUrls: string[];
  onCurrentIndexChange: (index: number) => void;
  onImageChangeConfirmed?: () => void;
}

export function useImageNavigation({ 
  imageUrls, 
  onCurrentIndexChange,
  onImageChangeConfirmed
}: UseImageNavigationProps) {
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const isChangingIndex = useRef<boolean>(false);
  const previousIndex = useRef<number>(0);
  const imageChangeConfirmed = useRef<boolean>(false);
  const imageChangeInProgress = useRef<boolean>(false);
  const imageNavigationLock = useRef<boolean>(false);
  const pendingIndexChangeRef = useRef<number | null>(null);
  const indexChangeAttemptCount = useRef<number>(0);

  const confirmImageChanged = () => {
    if (onImageChangeConfirmed) {
      onImageChangeConfirmed();
    }
    imageChangeConfirmed.current = true;
    imageChangeInProgress.current = false;
    
    Logger.info(`Image change confirmed at ${Date.now()}`);
    
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

  return {
    currentPreviewIndex,
    handlePrevPreview,
    handleNextPreview,
    setCurrentPreviewIndex,
    setCurrentPreviewIndexSafely,
    confirmImageChanged,
    isChangingIndex: () => isChangingIndex.current || imageNavigationLock.current,
    isNavigationLocked: () => imageNavigationLock.current
  };
}
