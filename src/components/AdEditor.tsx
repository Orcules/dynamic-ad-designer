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
import { capturePreview } from "@/utils/adPreviewCapture";

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

    setIsGenerating(true);
    toast.loading('Generating preview...');

    try {
      console.log('Starting ad generation process...');
      
      if (!previewRef.current) {
        throw new Error('Preview element not found');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Attempting to capture preview...');
      const previewFile = await capturePreview(previewRef, adData.platform);
      
      if (!previewFile) {
        throw new Error('Failed to capture preview');
      }
      console.log('Preview captured successfully');

      const previewUrl = await handleSubmission(previewFile);
      console.log('Preview uploaded, URL:', previewUrl);
      
      const imagesToProcess = selectedImages.length > 0 ? selectedImages : imageUrls;
      await processImages(
        adData,
        imagesToProcess,
        previewRef,
        onAdGenerated,
        handleSubmission,
        setIsGenerating
      );

      toast.success('Ad created successfully!');
    } catch (error) {
      console.error('Error creating ad:', error);
      toast.error('Error creating ad');
    } finally {
      setIsGenerating(false);
      toast.dismiss();
    }
  };

  const handlePreviewCapture = (file: File) => {
    console.log('Preview captured:', file);
    handleSubmission(file)
      .then(url => {
        console.log('Preview uploaded successfully:', url);
        toast.success('Preview captured and uploaded');
      })
      .catch(error => {
        console.error('Error uploading preview:', error);
        toast.error('Failed to upload preview');
      });
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
      
      <div className="w-full lg:w-1/2 space-y-6">
        <div ref={previewRef} className="preview-container">
          <AdPreviewCapture onCapture={handlePreviewCapture}>
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
        </div>

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
