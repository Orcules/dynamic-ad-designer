import React, { useState, useRef } from "react";
import { AdFormContainer } from "./AdFormContainer";
import { AdPreview } from "./AdPreview";
import { handleAdSubmission } from "./AdSubmissionHandler";
import { getDimensions } from "@/utils/adDimensions";
import { toast } from "sonner";

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
    cta_text: "",
    font_url: "",
    platform: "facebook",
    template_style: "",
    accent_color: "#4A90E2",
    cta_color: "#4A90E2",
    overlay_color: "#000000"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0.4);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(files);
      const urls = files.map(file => URL.createObjectURL(file));
      setImageUrls(urls);
      setCurrentPreviewIndex(0);
    }
  };

  const handleImageUrlsChange = (urls: string[]) => {
    const secureUrls = urls.map(ensureHttps);
    setImageUrls(secureUrls);
    setCurrentPreviewIndex(0);
  };

  const handleOpacityChange = (value: number) => {
    setOverlayOpacity(value);
  };

  const ensureHttps = (url: string) => {
    return url.replace(/^http:/, 'https:');
  };

  const handleFontChange = (value: string) => {
    setAdData((prev) => ({
      ...prev,
      font_url: value,
    }));
  };

  const handlePlatformChange = (value: string) => {
    setAdData((prev) => ({
      ...prev,
      platform: value,
    }));
  };

  const handleStyleChange = (value: string) => {
    setAdData((prev) => ({
      ...prev,
      template_style: value,
    }));
  };

  const handleColorChange = (value: string) => {
    setAdData((prev) => ({
      ...prev,
      accent_color: value,
    }));
  };

  const handleCtaColorChange = (value: string) => {
    setAdData((prev) => ({
      ...prev,
      cta_color: value,
    }));
  };

  const handleOverlayColorChange = (value: string) => {
    setAdData((prev) => ({
      ...prev,
      overlay_color: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adData.platform) {
      toast.error('Please select a platform');
      return;
    }

    setIsGenerating(true);

    try {
      const dimensions = getDimensions(adData.platform);
      const enrichedAdData = { ...adData, ...dimensions };

      if (selectedImages.length > 0) {
        for (let i = 0; i < selectedImages.length; i++) {
          try {
            await handleAdSubmission({
              adData: enrichedAdData,
              selectedImage: selectedImages[i],
              previewRef,
              onSuccess: onAdGenerated,
              setIsGenerating,
            });
          } catch (error) {
            console.error(`Error processing image ${i + 1}:`, error);
            toast.error(`Error processing image ${i + 1}`);
          }
        }
      } else if (imageUrls.length > 0) {
        for (let i = 0; i < imageUrls.length; i++) {
          try {
            const secureUrl = ensureHttps(imageUrls[i]);
            const response = await fetch(secureUrl);
            
            if (!response.ok) {
              throw new Error(`Failed to fetch image ${i + 1}`);
            }
            
            const blob = await response.blob();
            const file = new File([blob], `image_${i + 1}.jpg`, { type: 'image/jpeg' });
            
            await handleAdSubmission({
              adData: enrichedAdData,
              selectedImage: file,
              previewRef,
              onSuccess: onAdGenerated,
              setIsGenerating,
            });
          } catch (error) {
            console.error(`Error processing URL ${i + 1}:`, error);
            toast.error(`Error processing URL ${i + 1}`);
          }
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Error generating ad');
    } finally {
      setIsGenerating(false);
    }
  };

  const { width, height } = getDimensions(adData.platform);

  const handlePrevPreview = () => {
    setCurrentPreviewIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1));
  };

  const handleNextPreview = () => {
    setCurrentPreviewIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0));
  };

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
        onImageChange={handleImageChange}
        onImageUrlsChange={handleImageUrlsChange}
        onSubmit={handleSubmit}
        overlayOpacity={overlayOpacity}
        onOpacityChange={handleOpacityChange}
      />

      <div ref={previewRef}>
        <AdPreview
          imageUrl={imageUrls[currentPreviewIndex]}
          imageUrls={imageUrls}
          width={width}
          height={height}
          headline={adData.headline}
          ctaText={adData.cta_text}
          templateStyle={adData.template_style}
          accentColor={adData.accent_color}
          ctaColor={adData.cta_color}
          overlayColor={adData.overlay_color}
          fontUrl={adData.font_url}
          overlayOpacity={overlayOpacity}
          currentIndex={currentPreviewIndex}
          onPrevious={handlePrevPreview}
          onNext={handleNextPreview}
        />
      </div>
    </div>
  );
};

export default AdEditor;