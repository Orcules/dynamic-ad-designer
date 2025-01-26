import React, { useState, useRef } from "react";
import { AdFormContainer } from "./AdFormContainer";
import { AdPreview } from "./AdPreview";
import { handleAdSubmission } from "./AdSubmissionHandler";
import { getDimensions } from "@/utils/adDimensions";
import { format } from 'date-fns';

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
    platform: "",
    template_style: "",
    accent_color: "#4A90E2",
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
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
      if (files.length > 0) {
        setPreviewUrl(URL.createObjectURL(files[0]));
      }
    }
  };

  const handleImageUrlsChange = (urls: string[]) => {
    setImageUrls(urls);
    if (urls.length > 0) {
      setPreviewUrl(urls[0]);
    }
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

  const generateAdName = (adData: any, imageIndex: number, totalImages: number) => {
    const today = format(new Date(), 'ddMMyy');
    const baseName = adData.name.toLowerCase().replace(/\s+/g, '-');
    const lang = adData.language || 'he';
    const font = adData.font_url.split('family=')[1]?.split(':')[0]?.replace(/\+/g, '-').toLowerCase() || 'default';
    const template = adData.template_style || 'default';
    const color = adData.accent_color.replace('#', '');
    
    const suffix = totalImages > 1 ? `-${imageIndex + 1}` : '';
    
    return `${today}-${baseName}-${lang}-${font}-${template}-${color}${suffix}`
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      if (selectedImages.length > 0) {
        // Handle multiple file uploads
        for (let i = 0; i < selectedImages.length; i++) {
          const modifiedAdData = {
            ...adData,
            name: generateAdName(adData, i, selectedImages.length)
          };
          
          await handleAdSubmission({
            adData: modifiedAdData,
            selectedImage: selectedImages[i],
            previewRef,
            onSuccess: onAdGenerated,
            setIsGenerating,
          });
        }
      } else if (imageUrls.length > 0) {
        // Handle multiple URLs
        for (let i = 0; i < imageUrls.length; i++) {
          const modifiedAdData = {
            ...adData,
            name: generateAdName(adData, i, imageUrls.length)
          };
          
          const response = await fetch(imageUrls[i]);
          const blob = await response.blob();
          const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
          
          await handleAdSubmission({
            adData: modifiedAdData,
            selectedImage: file,
            previewRef,
            onSuccess: onAdGenerated,
            setIsGenerating,
          });
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const { width, height } = getDimensions(adData.platform);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <AdFormContainer
        adData={adData}
        isGenerating={isGenerating}
        onInputChange={handleInputChange}
        onFontChange={handleFontChange}
        onPlatformChange={handlePlatformChange}
        onStyleChange={handleStyleChange}
        onColorChange={handleColorChange}
        onImageChange={handleImageChange}
        onImageUrlsChange={handleImageUrlsChange}
        onSubmit={handleSubmit}
      />

      <div className="sticky top-8" ref={previewRef}>
        <AdPreview
          imageUrl={previewUrl || undefined}
          width={width}
          height={height}
          headline={adData.headline}
          ctaText={adData.cta_text}
          templateStyle={adData.template_style}
          accentColor={adData.accent_color}
          fontUrl={adData.font_url}
        />
      </div>
    </div>
  );
};

export default AdEditor;
