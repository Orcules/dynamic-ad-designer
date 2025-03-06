
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
  const previewRef = useRef<HTMLDivElement>(null);
  const imageGeneratorRef = useRef<ImageGenerator | null>(null);

  const {
    selectedImages,
    imageUrls,
    currentPreviewIndex,
    handleImageChange,
    handleImageUrlsChange,
    handlePrevPreview,
    handleNextPreview,
    setCurrentPreviewIndex
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

  // This effect directly updates the currentProcessingIndex when currentPreviewIndex changes
  useEffect(() => {
    if (!isGenerating) return;
    setCurrentProcessingIndex(currentPreviewIndex);
  }, [currentPreviewIndex, isGenerating]);

  // Function to ensure the preview index is set correctly
  const ensurePreviewIndex = async (targetIndex: number): Promise<boolean> => {
    Logger.info(`Ensuring preview index is set to ${targetIndex}, current: ${currentPreviewIndex}`);
    
    if (currentPreviewIndex === targetIndex) {
      return true;
    }
    
    // Directly set the index rather than clicking through
    setCurrentPreviewIndex(targetIndex);
    
    // Wait for the index change to take effect
    return new Promise((resolve) => {
      // We'll check multiple times if needed
      let attempts = 0;
      const maxAttempts = 5;
      const interval = setInterval(() => {
        attempts++;
        if (currentPreviewIndex === targetIndex) {
          clearInterval(interval);
          resolve(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          Logger.error(`Failed to set preview index to ${targetIndex} after ${maxAttempts} attempts`);
          resolve(false);
        }
      }, 200);
    });
  };

  // Function to capture the current preview image
  const capturePreview = async (): Promise<string> => {
    if (!imageGeneratorRef.current) {
      throw new Error("Image generator not initialized");
    }
    
    let captureRetries = 0;
    const maxCaptureRetries = 3;
    let previewUrl = '';
    
    while (!previewUrl && captureRetries < maxCaptureRetries) {
      try {
        // Wait a bit before capturing to ensure rendering is complete
        await new Promise(resolve => setTimeout(resolve, 500));
        previewUrl = await imageGeneratorRef.current.getImageUrl();
        Logger.info(`Generated preview URL on attempt ${captureRetries + 1}`);
        break;
      } catch (captureError) {
        captureRetries++;
        Logger.error(`Capture attempt ${captureRetries} failed: ${captureError instanceof Error ? captureError.message : String(captureError)}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (!previewUrl) {
      throw new Error("Failed to capture preview after multiple attempts");
    }
    
    return previewUrl;
  };

  const processImage = async (imageIndex: number, allImages: Array<File | string>): Promise<string | null> => {
    try {
      const currentImage = allImages[imageIndex];
      if (!currentImage) {
        Logger.error(`Invalid image at index ${imageIndex}`);
        return null;
      }
      
      Logger.info(`Processing image ${imageIndex + 1}/${allImages.length}`);
      
      // Ensure we're showing the correct preview
      const indexSet = await ensurePreviewIndex(imageIndex);
      if (!indexSet) {
        Logger.warn(`Could not set preview to index ${imageIndex}, but continuing anyway`);
        // Even if we couldn't set the index, we'll try to proceed
      }
      
      // Allow time for the preview to render
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Capture the preview
      const previewUrl = await capturePreview();
      
      // Process the image file
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
      
      // Upload the image
      let uploadedUrl = await handleSubmission(imageToUpload);
      if (!uploadedUrl) {
        throw new Error('No URL returned from upload');
      }
      
      const { width, height } = getDimensions(adData.platform);
      
      // Create the ad data object
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
      
      // Pass the generated ad data to the parent component
      onAdGenerated(adDataToGenerate);
      toast.success(`Generated ad ${imageIndex + 1} of ${allImages.length}`);
      
      return uploadedUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Error processing image ${imageIndex + 1}: ${errorMessage}`);
      toast.error(`Failed to process image ${imageIndex + 1}: ${errorMessage}`);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasImages = selectedImages.length > 0 || imageUrls.length > 0;
    if (!validateAdSubmission(adData.platform, hasImages)) {
      return;
    }

    if (!previewRef.current) {
      toast.error('Preview element not found');
      return;
    }

    setIsGenerating(true);

    try {
      Logger.info('Starting ad generation process...');
      
      // Preserve the original preview index so we can restore it later
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
        return;
      }

      // Process each image sequentially
      for (let i = 0; i < allImages.length; i++) {
        await processImage(i, allImages);
        // Add a small delay between processing images
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Restore the original preview index
      setCurrentPreviewIndex(originalPreviewIndex);
      
      toast.success(`All ${allImages.length} ads generated successfully!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Error in handleSubmit: ${errorMessage}`);
      toast.error(`Error generating ads: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
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
        />
      </div>
    </div>
  );
};

export default AdEditor;
