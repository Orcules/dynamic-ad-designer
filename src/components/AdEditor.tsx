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
    isChangingIndex
  } = useAdImageHandler({
    onImageChange: (urls) => {
      Logger.info(JSON.stringify({ message: 'Images changed', urls }));
    },
    onCurrentIndexChange: (index) => {
      Logger.info(JSON.stringify({ message: 'Current index changed', index }));
    }
  });

  const { handleSubmission, isSubmitting } = useAdSubmission();

  React.useEffect(() => {
    if (previewRef.current) {
      imageGeneratorRef.current = new ImageGenerator('.ad-content');
    }
  }, [previewRef.current]);

  const ensurePreviewIndex = async (targetIndex: number, maxRetries = 3): Promise<boolean> => {
    Logger.info(`Ensuring preview index is set to ${targetIndex}, current: ${currentPreviewIndex}`);
    
    if (currentPreviewIndex === targetIndex && !isChangingIndex()) {
      Logger.info(`Preview index is already ${targetIndex}`);
      return true;
    }
    
    if (isChangingIndex()) {
      Logger.info(`Waiting for ongoing index change to complete before setting to ${targetIndex}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    let success = false;
    let attempts = 0;
    
    while (!success && attempts < maxRetries) {
      attempts++;
      Logger.info(`Attempt ${attempts}/${maxRetries} to set preview index to ${targetIndex}`);
      
      success = await setCurrentPreviewIndexSafely(targetIndex);
      
      if (success) {
        Logger.info(`Successfully set preview index to ${targetIndex} on attempt ${attempts}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      }
      
      if (attempts < maxRetries) {
        Logger.warn(`Failed to set preview index to ${targetIndex}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (!success) {
      Logger.error(`Failed to set preview index to ${targetIndex} after ${maxRetries} attempts`);
    }
    
    return success;
  };

  const capturePreview = async (maxRetries = 3): Promise<string> => {
    if (!imageGeneratorRef.current) {
      throw new Error("Image generator not initialized");
    }
    
    let captureRetries = 0;
    let previewUrl = '';
    
    while (!previewUrl && captureRetries < maxRetries) {
      try {
        captureRetries++;
        await new Promise(resolve => setTimeout(resolve, 1000));
        previewUrl = await imageGeneratorRef.current.getImageUrl();
        Logger.info(`Generated preview URL on attempt ${captureRetries}`);
        break;
      } catch (captureError) {
        Logger.error(`Capture attempt ${captureRetries} failed: ${captureError instanceof Error ? captureError.message : String(captureError)}`);
        if (captureRetries >= maxRetries) break;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!previewUrl) {
      throw new Error("Failed to capture preview after multiple attempts");
    }
    
    return previewUrl;
  };

  const processImage = async (imageIndex: number, allImages: Array<File | string>): Promise<string | null> => {
    try {
      setProcessingStatus(prev => ({ ...prev, [imageIndex]: 'processing' }));
      setCurrentProcessingIndex(imageIndex);
      
      const currentImage = allImages[imageIndex];
      if (!currentImage) {
        Logger.error(`Invalid image at index ${imageIndex}`);
        setProcessingStatus(prev => ({ ...prev, [imageIndex]: 'failed' }));
        return null;
      }
      
      Logger.info(`Processing image ${imageIndex + 1}/${allImages.length}`);
      
      const indexSet = await ensurePreviewIndex(imageIndex);
      if (!indexSet) {
        Logger.warn(`Could not set preview to index ${imageIndex}, skipping this image`);
        setProcessingStatus(prev => ({ ...prev, [imageIndex]: 'failed' }));
        return null;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
      
      let uploadedUrl = await handleSubmission(imageToUpload);
      if (!uploadedUrl) {
        throw new Error('No URL returned from upload');
      }
      
      const { width, height } = getDimensions(adData.platform);
      
      const adDataToGenerate = {
        name: `${adData.headline || 'Untitled'} - Version ${imageIndex + 1}`,
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
      
      toast.success(`Generated ad ${imageIndex + 1} of ${allImages.length}`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    resetProcessedIndexes();

    try {
      Logger.info('Starting ad generation process...');
      
      const originalPreviewIndex = currentPreviewIndex;
      
      let allImages: Array<File | string> = [];
      
      if (selectedImages.length > 0) {
        allImages = [...selectedImages];
      } 
      else if (imageUrls.length > 0) {
        allImages = [...imageUrls];
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

      for (let i = 0; i < allImages.length; i++) {
        if (isIndexProcessed(i)) {
          Logger.info(`Image at index ${i} already processed, skipping`);
          continue;
        }
        
        setCurrentProcessingIndex(i);
        await processImage(i, allImages);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      const unprocessed = getUnprocessedIndexes();
      if (unprocessed.length > 0) {
        Logger.warn(`${unprocessed.length} images weren't processed. Retrying...`);
        
        for (const index of unprocessed) {
          setCurrentProcessingIndex(index);
          await processImage(index, allImages);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      await setCurrentPreviewIndexSafely(originalPreviewIndex);
      
      toast.success(`All ${allImages.length} ads generated successfully!`);
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
