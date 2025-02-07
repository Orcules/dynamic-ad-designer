import React, { useState } from "react";
import { AdFormContainer } from "./AdFormContainer";
import { AdPreview } from "./AdPreview";
import { getDimensions } from "@/utils/adDimensions";
import { toast } from "sonner";
import { useAdImageHandler } from "./ad/AdImageHandler";
import { AdPreviewCapture } from "./ad/AdPreviewCapture";
import { AdSubmissionHandler, useAdSubmission } from "./ad/AdSubmissionHandler";

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
  const [adData, setAdData] = useState({
    name: "",
    headline: "",
    description: "", // Added new field
    cta_text: "",
    font_url: "",
    platform: "instagram-story",
    template_style: "",
    accent_color: "#4A90E2",
    cta_color: "#4A90E2",
    overlay_color: "#000000",
    text_color: "#FFFFFF",
    description_color: "#333333" // Added new field for description color
  });

  const [overlayOpacity, setOverlayOpacity] = useState(0.4);
  const { isGenerating, setIsGenerating, handleSubmission } = useAdSubmission();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdData(prev => ({ ...prev, [name]: value }));
  };

  const handleFontChange = (value: string) => {
    setAdData(prev => ({ ...prev, font_url: value }));
  };

  const handlePlatformChange = (value: string) => {
    setAdData(prev => ({ ...prev, platform: value }));
  };

  const handleStyleChange = (value: string) => {
    setAdData(prev => ({ ...prev, template_style: value }));
  };

  const handleColorChange = (value: string) => {
    setAdData(prev => ({ ...prev, accent_color: value }));
  };

  const handleCtaColorChange = (value: string) => {
    setAdData(prev => ({ ...prev, cta_color: value }));
  };

  const handleOverlayColorChange = (value: string) => {
    setAdData(prev => ({ ...prev, overlay_color: value }));
  };

  const handleTextColorChange = (value: string) => {
    setAdData(prev => ({ ...prev, text_color: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adData.platform) {
      toast.error('Please select a platform');
      return;
    }

    const hasImages = selectedImages.length > 0 || imageUrls.length > 0;
    if (!hasImages) {
      toast.error('Please select at least one image');
      return;
    }

    setIsGenerating(true);

    try {
      const dimensions = getDimensions(adData.platform);
      const enrichedAdData = { ...adData, ...dimensions };
      
      const imagesToProcess = selectedImages.length > 0 ? selectedImages : imageUrls;
      
      for (let i = 0; i < imagesToProcess.length; i++) {
        const currentImage = imagesToProcess[i];
        
        try {
          let imageFile: File;
          if (currentImage instanceof File) {
            imageFile = currentImage;
          } else {
            const response = await fetch(currentImage);
            const blob = await response.blob();
            imageFile = new File([blob], `image_${i + 1}.jpg`, { type: 'image/jpeg' });
          }

          await handleSubmission(
            {
              ...enrichedAdData,
              name: `${adData.name}-${i + 1}`
            },
            imageFile,
            imageFile,
            onAdGenerated
          );
        } catch (error) {
          console.error(`Error processing image ${i + 1}:`, error);
          toast.error(`Error processing image ${i + 1}`);
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Error generating ads');
    } finally {
      setIsGenerating(false);
    }
  };

  const { width, height } = getDimensions(adData.platform);

  return (
    <div className="flex flex-col gap-8">
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
        onImageChange={handleImageChange}
        onImageUrlsChange={handleImageUrlsChange}
        onSubmit={handleSubmit}
        overlayOpacity={overlayOpacity}
        onOpacityChange={setOverlayOpacity}
      />

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
        />
      </AdPreviewCapture>
    </div>
  );
};

export default AdEditor;
