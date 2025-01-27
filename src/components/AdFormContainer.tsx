import React from "react";
import { Button } from "./ui/button";
import { AdForm } from "./AdForm";

interface AdFormContainerProps {
  adData: {
    name: string;
    headline: string;
    cta_text: string;
    font_url: string;
    platform: string;
    template_style: string;
    accent_color: string;
  };
  isGenerating: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFontChange: (value: string) => void;
  onPlatformChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUrlsChange: (urls: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AdFormContainer: React.FC<AdFormContainerProps> = ({
  adData,
  isGenerating,
  onInputChange,
  onFontChange,
  onPlatformChange,
  onStyleChange,
  onColorChange,
  onImageChange,
  onImageUrlsChange,
  onSubmit,
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
        onImageChange={onImageChange}
        onImageUrlsChange={onImageUrlsChange}
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