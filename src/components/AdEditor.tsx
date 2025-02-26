
import React, { useState, useRef } from "react";
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
    formState,
    handleInputChange,
    handleFontChange,
    handlePlatformChange,
    handleStyleChange,
    handleColorChange,
    handleCtaColorChange,
    handleOverlayColorChange,
    handleTextColorChange,
    handleDescriptionColorChange,
    updatePosition
  } = useAdForm();

  const [isGenerating, setIsGenerating] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0.4);
  const [showCtaArrow, setShowCtaArrow] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);
  const imageGeneratorRef = useRef<ImageGenerator | null>(null);

  const {
    selectedImages,
    imageUrls,
    currentPreviewIndex,
    handleImageChange,
    handleImageUrlsChange,
    handlePrevPreview,
    handleNextPreview
  } = useAdImageHandler({
    onImageChange: (urls) => {
      Logger.info(JSON.stringify({ message: 'Images changed', urls }));
    },
    onCurrentIndexChange: (index) => {
      Logger.info(JSON.stringify({ message: 'Current index changed', index }));
    }
  });

  const { handleSubmission } = useAdSubmission();

  // Ensure the image generator is initialized
  React.useEffect(() => {
    if (previewRef.current) {
      imageGeneratorRef.current = new ImageGenerator('.ad-content');
    }
  }, [previewRef.current]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasImages = selectedImages.length > 0 || imageUrls.length > 0;
    if (!validateAdSubmission(formState.platform, hasImages)) {
      return;
    }

    if (!previewRef.current) {
      toast.error('Preview element not found');
      return;
    }

    setIsGenerating(true);

    try {
      Logger.info('Starting ad generation process...');
      
      // Use positions from formState
      const positions = {
        headlinePosition: formState.headlinePosition,
        descriptionPosition: formState.descriptionPosition,
        ctaPosition: formState.ctaPosition,
        imagePosition: formState.imagePosition
      };
      
      // Processing images
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
      
      for (let i = 0; i < allImages.length; i++) {
        try {
          const currentImage = allImages[i];
          if (!currentImage) {
            Logger.error(`Skipping empty image at index ${i}`);
            continue;
          }
          
          Logger.info(`Processing image ${i + 1}/${allImages.length}: ${typeof currentImage === 'string' ? currentImage.substring(0, 30) + '...' : currentImage.name}`);
          
          const { width, height } = getDimensions(formState.platform);
          
          let imageToUpload: File;
          if (typeof currentImage === 'string') {
            if (!currentImage.trim() || currentImage === 'undefined') {
              Logger.error(`Skipping invalid image URL: ${currentImage}`);
              continue;
            }
            
            try {
              const response = await fetch(currentImage);
              if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
              }
              const blob = await response.blob();
              if (blob.size === 0) {
                Logger.error(`Empty blob for URL: ${currentImage}`);
                continue;
              }
              imageToUpload = new File([blob], `image-${i + 1}.${blob.type.split('/')[1] || 'jpg'}`, { 
                type: blob.type || 'image/jpeg' 
              });
            } catch (fetchError) {
              Logger.error(`Failed to process image URL: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
              continue;
            }
          } else {
            imageToUpload = currentImage;
          }
          
          if (imageToUpload.size === 0) {
            Logger.error(`Skipping zero-size image: ${imageToUpload.name}`);
            continue;
          }
          
          if (i !== currentPreviewIndex && allImages.length > 1) {
            if (i > currentPreviewIndex) {
              handleNextPreview();
            } else {
              handlePrevPreview();
            }
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          let previewUrl = '';
          if (imageGeneratorRef.current) {
            try {
              previewUrl = await imageGeneratorRef.current.getImageUrl();
              Logger.info(`Generated preview URL of length: ${previewUrl.length}`);
            } catch (captureError) {
              Logger.error(`Error capturing preview: ${captureError instanceof Error ? captureError.message : String(captureError)}`);
            }
          }
          
          Logger.info(`Starting file upload: ${JSON.stringify({
            name: imageToUpload.name,
            size: imageToUpload.size,
            type: imageToUpload.type
          })}`);
          
          const uploadedUrl = await handleSubmission(imageToUpload);
          
          if (!uploadedUrl) {
            Logger.error('Failed to upload image, no URL returned');
            continue;
          }
          
          const adDataToGenerate = {
            name: `${formState.headline || 'Untitled'} - Version ${i + 1}`,
            headline: formState.headline,
            description: formState.description,
            cta_text: formState.ctaText,
            font_url: formState.fontUrl,
            platform: formState.platform,
            template_style: formState.templateStyle,
            accent_color: formState.accentColor,
            cta_color: formState.ctaColor,
            overlay_color: formState.overlayColor,
            text_color: formState.textColor,
            description_color: formState.descriptionColor,
            image_url: uploadedUrl,
            preview_url: previewUrl || uploadedUrl,
            width,
            height,
            status: 'completed'
          };
          
          onAdGenerated(adDataToGenerate);
          
          toast.success(`Generated ad ${i + 1} of ${allImages.length}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          Logger.error(`Error processing image ${i + 1}: ${errorMessage}`);
          toast.error(`Failed to process image ${i + 1}`);
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Error in handleSubmit: ${errorMessage}`);
      toast.error('Error generating ads');
    } finally {
      setIsGenerating(false);
    }
  };

  const { width, height } = getDimensions(formState.platform || 'facebook');

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-1/2">
        <AdFormContainer
          adData={{
            name: '',
            headline: formState.headline,
            description: formState.description,
            cta_text: formState.ctaText,
            font_url: formState.fontUrl,
            platform: formState.platform || 'facebook',
            template_style: formState.templateStyle,
            accent_color: formState.accentColor,
            cta_color: formState.ctaColor,
            overlay_color: formState.overlayColor,
            text_color: formState.textColor,
            description_color: formState.descriptionColor
          }}
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
          headlinePosition={formState.headlinePosition}
          descriptionPosition={formState.descriptionPosition}
          ctaPosition={formState.ctaPosition}
          imagePosition={formState.imagePosition}
          onHeadlinePositionChange={(position) => updatePosition('headline', position)}
          onDescriptionPositionChange={(position) => updatePosition('description', position)}
          onCtaPositionChange={(position) => updatePosition('cta', position)}
          onImagePositionChange={(position) => updatePosition('image', position)}
        />
      </div>
      
      <div className="w-full lg:w-1/2 space-y-6" ref={previewRef}>
        <div>
          <AdPreview
            imageUrl={imageUrls[currentPreviewIndex]}
            imageUrls={imageUrls}
            width={width}
            height={height}
            headline={formState.headline}
            description={formState.description}
            descriptionColor={formState.descriptionColor}
            ctaText={formState.ctaText}
            templateStyle={formState.templateStyle}
            accentColor={formState.accentColor}
            ctaColor={formState.ctaColor}
            overlayColor={formState.overlayColor}
            textColor={formState.textColor}
            fontUrl={formState.fontUrl}
            overlayOpacity={overlayOpacity}
            currentIndex={currentPreviewIndex}
            onPrevious={handlePrevPreview}
            onNext={handleNextPreview}
            headlinePosition={formState.headlinePosition}
            descriptionPosition={formState.descriptionPosition}
            ctaPosition={formState.ctaPosition}
            imagePosition={formState.imagePosition}
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
