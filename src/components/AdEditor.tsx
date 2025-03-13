import React, { useState, useRef, useEffect } from "react";
import { AdFormContainer } from "./AdFormContainer";
import { AdPreview } from "./AdPreview";
import { toast } from "sonner";
import { useAdImageHandler } from "./ad/AdImageHandler";
import { useAdSubmission } from "@/hooks/useAdSubmission";
import { AdPreviewControls } from "./ad/AdPreviewControls";
import { AdSubmitButton } from "./ad/AdSubmitButton";
import { useAdForm } from "@/hooks/useAdForm";
import { validateAdSubmission } from "@/utils/adValidation";
import { getDimensions } from "@/utils/adDimensions";
import { Logger } from "@/utils/logger";
import { ImageGenerator } from "@/utils/ImageGenerator";

interface Template {
  id: string;
  title: string;
  dimensions: string;
  imageUrl: string;
  description: string;
}

interface AdEditorProps {
  template: Template;
  onAdGenerated: (adData: any) => void;
}

const AdEditor: React.FC<AdEditorProps> = ({ template, onAdGenerated }) => {
  const {
    adData,
    handleInputChange,
    handleFontChange,
    handlePlatformChange,
    handleStyleChange,
    handleColorChange,
    handleCtaColorChange,
    handleOverlayColorChange,
    handleTextColorChange,
    handleDescriptionColorChange
  } = useAdForm();

  const [isGenerating, setIsGenerating] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0.4);
  const [headlinePosition, setHeadlinePosition] = useState({ x: 0, y: 0 });
  const [descriptionPosition, setDescriptionPosition] = useState({ x: 0, y: 0 });
  const [ctaPosition, setCtaPosition] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [showCtaArrow, setShowCtaArrow] = useState(true);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<Record<number, 'pending' | 'processing' | 'completed' | 'failed'>>({});
  const previewRef = useRef<HTMLDivElement>(null);
  const imageGeneratorRef = useRef<ImageGenerator | null>(null);
  const generationInProgress = useRef<boolean>(false);
  const currentRenderingIndex = useRef<number>(-1);
  const imageChangeConfirmed = useRef<boolean>(false);
  const waitingForImageRender = useRef<boolean>(false);
  const processingStartTime = useRef<number>(0);

  const {
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
    isChangingIndex,
    confirmImageChanged,
    preloadImage,
    getPreloadedImage,
    isImageUrlProcessed
  } = useAdImageHandler({
    onImageChange: (urls) => {
      Logger.info(JSON.stringify({ message: 'Images changed', urls }));
    },
    onCurrentIndexChange: (index) => {
      Logger.info(JSON.stringify({ message: 'Current index changed', index }));
      imageChangeConfirmed.current = false;
    },
    onImageChangeConfirmed: () => {
      imageChangeConfirmed.current = true;
      Logger.info('Image change confirmed');
    }
  });

  const { handleSubmission, isSubmitting } = useAdSubmission();

  React.useEffect(() => {
    if (previewRef.current) {
      imageGeneratorRef.current = new ImageGenerator('.ad-content');
    }
  }, [previewRef.current]);

  useEffect(() => {
    if (waitingForImageRender.current && currentRenderingIndex.current !== -1) {
      const timer = setTimeout(() => {
        confirmImageChanged();
        waitingForImageRender.current = false;
        Logger.info(`Image change for index ${currentRenderingIndex.current} confirmed after render`);
      }, 500); // Reduced from 1000ms
      
      return () => clearTimeout(timer);
    }
  }, [currentPreviewIndex, confirmImageChanged]);

  const ensurePreviewIndex = async (targetIndex: number, maxRetries = 2): Promise<boolean> => {
    Logger.info(`Ensuring preview index is set to ${targetIndex}, current: ${currentPreviewIndex}`);
    
    if (currentPreviewIndex === targetIndex && !isChangingIndex()) {
      if (imageChangeConfirmed.current) {
        Logger.info(`Preview index is already ${targetIndex} and image is confirmed`);
        return true;
      } else {
        Logger.info(`Preview index is ${targetIndex} but image change not confirmed yet`);
      }
    }
    
    if (isChangingIndex()) {
      Logger.info(`Waiting for ongoing index change to complete before setting to ${targetIndex}`);
      await new Promise(resolve => setTimeout(resolve, 400)); // Reduced from 800ms
    }
    
    let success = false;
    let attempts = 0;
    
    while (!success && attempts < maxRetries) {
      attempts++;
      Logger.info(`Attempt ${attempts}/${maxRetries} to set preview index to ${targetIndex}`);
      
      imageChangeConfirmed.current = false;
      waitingForImageRender.current = true;
      currentRenderingIndex.current = targetIndex;
      
      success = await setCurrentPreviewIndexSafely(targetIndex);
      
      if (success) {
        Logger.info(`Successfully set preview index to ${targetIndex} on attempt ${attempts}`);
        
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
          }, 1500); // Reduced from 3000ms
        });
        
        Logger.info(`Image change confirmed: ${imageChangeConfirmed.current}`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Reduced from 1000ms
        return imageChangeConfirmed.current;
      }
      
      if (attempts < maxRetries) {
        Logger.warn(`Failed to set preview index to ${targetIndex}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 400)); // Reduced from 800ms
      }
    }
    
    if (!success) {
      Logger.error(`Failed to set preview index to ${targetIndex} after ${maxRetries} attempts`);
    }
    
    return success && imageChangeConfirmed.current;
  };

  const capturePreview = async (maxRetries = 2): Promise<string> => {
    if (!imageGeneratorRef.current) {
      throw new Error("Image generator not initialized");
    }
    
    let captureRetries = 0;
    let previewUrl = '';
    
    while (!previewUrl && captureRetries < maxRetries) {
      try {
        captureRetries++;
        // Reduced waiting time before capture
        await new Promise(resolve => setTimeout(resolve, 800)); // Reduced from 1500ms
        previewUrl = await imageGeneratorRef.current.getImageUrl();
        Logger.info(`Generated preview URL on attempt ${captureRetries}`);
        break;
      } catch (captureError) {
        Logger.error(`Capture attempt ${captureRetries} failed: ${captureError instanceof Error ? captureError.message : String(captureError)}`);
        if (captureRetries >= maxRetries) break;
        await new Promise(resolve => setTimeout(resolve, 600)); // Reduced from 1200ms
      }
    }
    
    if (!previewUrl) {
      throw new Error("Failed to capture preview after multiple attempts");
    }
    
    return previewUrl;
  };

  const processImage = async (imageIndex: number, allImages: Array<File | string>): Promise<string | null> => {
    try {
      const startTime = performance.now();
      processingStartTime.current = startTime;
      
      setProcessingStatus(prev => ({ ...prev, [imageIndex]: 'processing' }));
      setCurrentProcessingIndex(imageIndex);
      
      const currentImage = allImages[imageIndex];
      if (!currentImage) {
        Logger.error(`Invalid image at index ${imageIndex}`);
        setProcessingStatus(prev => ({ ...prev, [imageIndex]: 'failed' }));
        return null;
      }
      
      // Check if this image URL has already been processed - this prevents duplicates
      if (typeof currentImage === 'string' && isImageUrlProcessed && isImageUrlProcessed(currentImage)) {
        Logger.warn(`Image URL at index ${imageIndex} has already been processed, skipping to prevent duplicate: ${currentImage.substring(0, 50)}...`);
        setProcessingStatus(prev => ({ ...prev, [imageIndex]: 'completed' }));
        return currentImage; // Return the URL but don't process it again
      }
      
      Logger.info(`Processing image ${imageIndex + 1}/${allImages.length}: ${typeof currentImage === 'string' ? currentImage.substring(0, 50) + '...' : currentImage.name}`);
      
      const indexSet = await ensurePreviewIndex(imageIndex);
      if (!indexSet) {
        Logger.warn(`Could not set preview to index ${imageIndex} or image change not confirmed, skipping this image`);
        setProcessingStatus(prev => ({ ...prev, [imageIndex]: 'failed' }));
        return null;
      }
      
      // Reduced waiting time
      await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced from 2000ms
      
      if (currentPreviewIndex !== imageIndex) {
        Logger.error(`Preview index mismatch: expected ${imageIndex}, got ${currentPreviewIndex}`);
        await ensurePreviewIndex(imageIndex);
        await new Promise(resolve => setTimeout(resolve, 750)); // Reduced from 1500ms
      }
      
      if (!imageChangeConfirmed.current) {
        Logger.warn(`Image change not confirmed for index ${imageIndex}, forcing another index change`);
        await setCurrentPreviewIndexSafely(imageIndex === 0 ? 1 : 0);
        await new Promise(resolve => setTimeout(resolve, 500)); // Reduced from 1000ms
        await setCurrentPreviewIndexSafely(imageIndex);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced from 2000ms
      }
      
      const previewUrl = await capturePreview();
      
      let imageToUpload: File;
      
      if (typeof currentImage === 'string') {
        if (!currentImage.trim() || currentImage === 'undefined') {
          throw new Error(`Invalid image URL: ${currentImage}`);
        }
        
        try {
          const response = await fetch(currentImage);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }
          
          const blob = await response.blob();
          if (blob.size === 0) {
            throw new Error(`Empty blob for URL: ${currentImage}`);
          }
          
          const fileExt = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
          imageToUpload = new File([blob], `image-${Date.now()}-${imageIndex}.${fileExt}`, { 
            type: blob.type || 'image/jpeg' 
          });
        } catch (fetchError) {
          throw new Error(`Failed to process image URL: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
        }
      } else {
        imageToUpload = currentImage;
      }
      
      if (imageToUpload.size === 0) {
        throw new Error(`Skipping zero-size image: ${imageToUpload.name}`);
      }
      
      const adName = adData.headline 
        ? `${adData.headline.substring(0, 30)}` 
        : `Untitled Ad`;
      
      const language = document.documentElement.lang || navigator.language || 'en';
      const fontName = adData.font_url?.split('/').pop()?.split('.')[0] || 'default';
      const { width, height } = getDimensions(adData.platform);
      const aspectRatio = `${width}-${height}`;
      const templateStyle = adData.template_style || 'standard';
      const version = imageIndex + 1;
      
      let uploadedUrl = await handleSubmission(
        imageToUpload, 
        previewUrl, 
        adName, 
        language, 
        fontName, 
        aspectRatio, 
        templateStyle, 
        version
      );
      
      if (!uploadedUrl) {
        throw new Error('No URL returned from upload');
      }
      
      const adDataToGenerate = {
        name: adName,
        headline: adData.headline,
        description: adData.description,
        cta_text: adData.cta_text,
        font_url: adData.font_url,
        platform: adData.platform,
        template_style: adData.template_style,
        accent_color: adData.accent_color,
        cta_color: adData.cta_color,
        overlay_color: adData.overlay_color,
        text_color: adData.text_color,
        description_color: adData.description_color,
        image_url: uploadedUrl,
        preview_url: previewUrl || uploadedUrl,
        width,
        height,
        status: 'completed'
      };
      
      markIndexProcessed(imageIndex);
      
      onAdGenerated(adDataToGenerate);
      
      setProcessingStatus(prev => ({ ...prev, [imageIndex]: 'completed' }));
      
      const processingTime = (performance.now() - startTime) / 1000;
      toast.success(`Generated ad ${imageIndex + 1} of ${allImages.length} in ${processingTime.toFixed(1)}s`);
      
      await new Promise(resolve => setTimeout(resolve, 750)); // Reduced from 1500ms
      
      return uploadedUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Error processing image ${imageIndex + 1}: ${errorMessage}`);
      toast.error(`Failed to process image ${imageIndex + 1}: ${errorMessage}`);
      
      setProcessingStatus(prev => ({ ...prev, [imageIndex]: 'failed' }));
      
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (generationInProgress.current) {
      toast.info("Ad generation already in progress");
      return;
    }
    
    const hasImages = selectedImages.length > 0 || imageUrls.length > 0;
    if (!validateAdSubmission(adData.platform, hasImages)) {
      return;
    }

    if (!previewRef.current) {
      toast.error('Preview element not found');
      return;
    }

    setIsGenerating(true);
    generationInProgress.current = true;
    resetProcessedIndexes(); // This now resets both processed indexes and URLs
    processingStartTime.current = performance.now();

    try {
      Logger.info('Starting ad generation process...');
      
      const originalPreviewIndex = currentPreviewIndex;
      
      let allImages: Array<File | string> = [];
      
      if (selectedImages.length > 0) {
        allImages = [...selectedImages];
      } 
      else if (imageUrls.length > 0) {
        // Ensure we're working with unique image URLs by using a Set
        allImages = [...new Set(imageUrls)];
        Logger.info(`Deduplicating ${imageUrls.length} image URLs to ${allImages.length} unique URLs`);
      }
      
      Logger.info(`Processing ${allImages.length} images`);
      
      if (allImages.length === 0) {
        toast.error('No valid images to process');
        setIsGenerating(false);
        generationInProgress.current = false;
        return;
      }

      const initialStatus: Record<number, 'pending' | 'processing' | 'completed' | 'failed'> = {};
      allImages.forEach((_, i) => {
        initialStatus[i] = 'pending';
      });
      setProcessingStatus(initialStatus);

      // Process images sequentially with reduced wait times
      for (let i = 0; i < allImages.length; i++) {
        // Skip already processed indexes (shouldn't happen after reset, but just in case)
        if (isIndexProcessed(i)) {
          Logger.info(`Image at index ${i} already processed, skipping`);
          continue;
        }
        
        // Skip already processed image URLs to prevent duplicates
        const currentImage = allImages[i];
        if (typeof currentImage === 'string' && isImageUrlProcessed && isImageUrlProcessed(currentImage)) {
          Logger.warn(`Image URL at index ${i} has already been processed, skipping to prevent duplicate: ${currentImage.substring(0, 50)}...`);
          continue;
        }
        
        setCurrentProcessingIndex(i);
        await processImage(i, allImages);
        
        // Add a short delay between processing images to allow UI updates
        await new Promise(resolve => setTimeout(resolve, 750));
      }

      const unprocessed = getUnprocessedIndexes();
      if (unprocessed.length > 0) {
        Logger.warn(`${unprocessed.length} images weren't processed. Retrying...`);
        
        for (const index of unprocessed) {
          // Skip already processed image URLs to prevent duplicates
          const currentImage = allImages[index];
          if (typeof currentImage === 'string' && isImageUrlProcessed && isImageUrlProcessed(currentImage)) {
            Logger.warn(`On retry: Image URL at index ${index} has already been processed, skipping to prevent duplicate: ${currentImage.substring(0, 50)}...`);
            continue;
          }
          
          setCurrentProcessingIndex(index);
          await processImage(index, allImages);
          await new Promise(resolve => setTimeout(resolve, 750));
        }
      }

      await setCurrentPreviewIndexSafely(originalPreviewIndex);
      
      const totalProcessingTime = (performance.now() - processingStartTime.current) / 1000;
      toast.success(`All ${allImages.length} ads generated in ${totalProcessingTime.toFixed(1)}s!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Error in handleSubmit: ${errorMessage}`);
      toast.error(`Error generating ads: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
      generationInProgress.current = false;
    }
  };

  const { width, height } = getDimensions(adData.platform);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-1/2">
        <AdFormContainer
          adData={adData}
          isGenerating={isGenerating}
          onInputChange={handleInputChange}
          onFontChange={handleFontChange}
          onPlatformChange={handlePlatformChange}
          onStyleChange={handleStyleChange}
          onColorChange={handleColorChange}
          onCtaColorChange={handleCtaColorChange}
          onOverlayColorChange={handleOverlayColorChange}
          onTextColorChange={handleTextColorChange}
          onDescriptionColorChange={handleDescriptionColorChange}
          onImageChange={handleImageChange}
          onImageUrlsChange={handleImageUrlsChange}
          overlayOpacity={overlayOpacity}
          onOpacityChange={setOverlayOpacity}
          headlinePosition={headlinePosition}
          descriptionPosition={descriptionPosition}
          ctaPosition={ctaPosition}
          imagePosition={imagePosition}
          onHeadlinePositionChange={setHeadlinePosition}
          onDescriptionPositionChange={setDescriptionPosition}
          onCtaPositionChange={setCtaPosition}
          onImagePositionChange={setImagePosition}
        />
      </div>
      
      <div className="w-full lg:w-1/2 space-y-6" ref={previewRef}>
        <div>
          <AdPreview
            imageUrl={imageUrls[currentPreviewIndex]}
            imageUrls={imageUrls}
            width={width}
            height={height}
            headline={adData.headline}
            description={adData.description}
            descriptionColor={adData.description_color}
            ctaText={adData.cta_text}
            templateStyle={adData.template_style}
            accentColor={adData.accent_color}
            ctaColor={adData.cta_color}
            overlayColor={adData.overlay_color}
            textColor={adData.text_color}
            fontUrl={adData.font_url}
            overlayOpacity={overlayOpacity}
            currentIndex={currentPreviewIndex}
            onPrevious={handlePrevPreview}
            onNext={handleNextPreview}
            headlinePosition={headlinePosition}
            descriptionPosition={descriptionPosition}
            ctaPosition={ctaPosition}
            imagePosition={imagePosition}
            showCtaArrow={showCtaArrow}
            onImageLoaded={confirmImageChanged}
            fastRenderMode={true} // Enable fast render mode by default
            preloadedImage={getPreloadedImage(imageUrls[currentPreviewIndex])}
          />
        </div>

        <AdPreviewControls
          showCtaArrow={showCtaArrow}
          onShowCtaArrowChange={setShowCtaArrow}
        />

        <AdSubmitButton
          isGenerating={isGenerating}
          onClick={handleSubmit}
          imageCount={imageUrls.length}
          currentProcessingIndex={currentProcessingIndex}
        />
      </div>
    </div>
  );
};

export default AdEditor;
