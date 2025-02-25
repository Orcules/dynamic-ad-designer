
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
  const previewRef = useRef<HTMLDivElement>(null);

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
      
      const positions = {
        headlinePosition,
        descriptionPosition,
        ctaPosition,
        imagePosition
      };
      
      const allImages = selectedImages.length > 0 ? selectedImages : imageUrls;
      
      for (let i = 0; i < allImages.length; i++) {
        try {
          const currentImage = allImages[i];
          Logger.info(`Processing image ${i + 1}/${allImages.length}`);
          
          const { width, height } = getDimensions(adData.platform);
          
          // Create a File object from URL if needed
          let imageToUpload: File;
          if (typeof currentImage === 'string') {
            try {
              const response = await fetch(currentImage);
              if (!response.ok) throw new Error('Failed to fetch image');
              const blob = await response.blob();
              imageToUpload = new File([blob], `image-${i + 1}.${blob.type.split('/')[1] || 'jpg'}`, { 
                type: blob.type || 'image/jpeg' 
              });
            } catch (fetchError) {
              throw new Error(`Failed to process image URL: ${fetchError.message}`);
            }
          } else {
            imageToUpload = currentImage;
          }
          
          const uploadedUrl = await handleSubmission(imageToUpload);
          
          if (!uploadedUrl) {
            throw new Error('Failed to upload image');
          }
          
          onAdGenerated({
            name: `${adData.headline || 'Untitled'} - Version ${i + 1}`,
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
            image_url: typeof currentImage === 'string' ? currentImage : uploadedUrl,
            preview_url: uploadedUrl,
            width,
            height,
            status: 'completed'
          });
          
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
