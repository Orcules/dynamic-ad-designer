import React from "react";
import { Button } from "./ui/button";
import { AdForm } from "./AdForm";

interface AdFormContainerProps {
  adData: {
    name: string;
    headline: string;
    description: string;
    cta_text: string;
    font_url: string;
    platform: string;
    template_style: string;
    accent_color: string;
    cta_color: string;
    overlay_color: string;
    text_color: string;
    description_color: string;
  };
  isGenerating: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFontChange: (value: string) => void;
  onPlatformChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onCtaColorChange: (value: string) => void;
  onOverlayColorChange: (value: string) => void;
  onTextColorChange: (value: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUrlsChange: (urls: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  overlayOpacity: number;
  onOpacityChange: (value: number) => void;
}

export const AdFormContainer: React.FC<AdFormContainerProps> = ({
  adData,
  isGenerating,
  onInputChange,
  onFontChange,
  onPlatformChange,
  onStyleChange,
  onColorChange,
  onCtaColorChange,
  onOverlayColorChange,
  onTextColorChange,
  onImageChange,
  onImageUrlsChange,
  onSubmit,
  overlayOpacity,
  onOpacityChange,
}) => {
  return (
    <div className="bg-card p-6 rounded-lg">
      <AdForm
        adData={adData}
        onInputChange={onInputChange}
        onFontChange={onFontChange}
        onPlatformChange={onPlatformChange}
        onStyleChange={onStyleChange}
        onColorChange={onColorChange}
        onCtaColorChange={onCtaColorChange}
        onOverlayColorChange={onOverlayColorChange}
        onTextColorChange={onTextColorChange}
        onImageChange={onImageChange}
        onImageUrlsChange={onImageUrlsChange}
        overlayOpacity={overlayOpacity}
        onOpacityChange={onOpacityChange}
      />
      <Button 
        type="submit" 
        className="w-full mt-6" 
        disabled={isGenerating} 
        onClick={onSubmit}
      >
        {isGenerating ? 'Generating Ad...' : 'Generate Ad'}
      </Button>
    </div>
  );
};