
import React, { useState, useRef } from "react";
import { AdFormContainer } from "./AdFormContainer";
import { AdPreview } from "./AdPreview";
import { toast } from "sonner";
import { useAdImageHandler } from "./ad/AdImageHandler";
import { AdPreviewCapture } from "./ad/AdPreviewCapture";
import { useAdSubmission } from "@/hooks/useAdSubmission";
import { AdPositionControls } from "./ad/AdPositionControls";
import { AdPreviewControls } from "./ad/AdPreviewControls";
import { AdSubmitButton } from "./ad/AdSubmitButton";
import { useAdForm } from "@/hooks/useAdForm";
import { validateAdSubmission } from "@/utils/adValidation";
import { processImages } from "@/utils/adImageProcessing";
import { getDimensions } from "@/utils/adDimensions";

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
    onImageChange: (urls) => console.log("Images changed:", urls),
    onCurrentIndexChange: (index) => console.log("Current index changed:", index)
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
      const imagesToProcess = selectedImages.length > 0 ? selectedImages : imageUrls;
      await processImages(
        adData,
        imagesToProcess,
        previewRef,
        onAdGenerated,
        handleSubmission,
        setIsGenerating
      );
    } catch (error) {
      console.error('Error in handleSubmit:', error);
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
        />
      </div>
      
      <div className="w-full lg:w-1/2 space-y-6" ref={previewRef}>
        <AdPreviewCapture onCapture={(file) => console.log('Preview captured:', file)}>
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
        </AdPreviewCapture>

        <AdPreviewControls
          showCtaArrow={showCtaArrow}
          onShowCtaArrowChange={setShowCtaArrow}
        />

        <AdPositionControls
          headlinePosition={headlinePosition}
          descriptionPosition={descriptionPosition}
          ctaPosition={ctaPosition}
          imagePosition={imagePosition}
          onHeadlinePositionChange={setHeadlinePosition}
          onDescriptionPositionChange={setDescriptionPosition}
          onCtaPositionChange={setCtaPosition}
          onImagePositionChange={setImagePosition}
        />

        <AdSubmitButton
          isGenerating={isGenerating}
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
};

export default AdEditor;
