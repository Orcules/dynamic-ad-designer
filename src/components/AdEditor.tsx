
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
import { getDimensions } from "@/utils/adDimensions";
import { capturePreview } from "@/utils/adPreviewCapture";
import { supabase } from "@/integrations/supabase/client";

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
    const loadingToast = toast.loading('Generating ads...');

    try {
      const imagesToProcess = selectedImages.length > 0 ? selectedImages : imageUrls;
      const generatedAds = [];

      for (let i = 0; i < imagesToProcess.length; i++) {
        const imageFile = imagesToProcess[i];
        
        try {
          // Wait for the preview to be ready
          await new Promise(resolve => setTimeout(resolve, 1000));

          if (!previewRef.current) {
            throw new Error('Preview element not found');
          }

          console.log(`Capturing preview for image ${i + 1} of ${imagesToProcess.length}`);
          const previewFile = await capturePreview(previewRef, adData.platform);
          
          if (!previewFile) {
            throw new Error('Failed to capture preview');
          }

          const uploadId = crypto.randomUUID();
          const enrichedAdData = {
            ...adData,
            status: 'completed',
            ...getDimensions(adData.platform)
          };

          const newAd = await handleSubmission(enrichedAdData, imageFile, previewRef, (generatedAd) => {
            generatedAds.push(generatedAd);
            onAdGenerated(generatedAd);
          });

          if (newAd) {
            console.log(`Successfully generated ad ${i + 1}`);
          }

          // Move to next image if there are more
          if (i < imagesToProcess.length - 1) {
            handleNextPreview();
            // Wait for the next image to load
            await new Promise(resolve => setTimeout(resolve, 500));
          }

        } catch (error) {
          console.error(`Error processing image ${i + 1}:`, error);
          toast.error(`Failed to generate ad ${i + 1}`);
        }
      }

      toast.success(`Successfully generated ${generatedAds.length} ads!`);
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Failed to generate ads');
    } finally {
      setIsGenerating(false);
      toast.dismiss(loadingToast);
    }
  };

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
          <AdPreview
            imageUrl={imageUrls[currentPreviewIndex]}
            imageUrls={imageUrls}
            width={getDimensions(adData.platform).width}
            height={getDimensions(adData.platform).height}
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
