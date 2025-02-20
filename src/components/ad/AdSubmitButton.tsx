
import React from 'react';
import { Button } from "../ui/button";
import { ImageGenerator } from "@/utils/ImageGenerator";

interface AdSubmitButtonProps {
  isGenerating: boolean;
  onClick: (e: React.MouseEvent) => void;
  imageCount?: number;
}

export const AdSubmitButton: React.FC<AdSubmitButtonProps> = ({
  isGenerating,
  onClick,
  imageCount = 0
}) => {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      onClick(e);
    } catch (error) {
      console.error('Error in submit button:', error);
    }
  };

  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={isGenerating} 
      onClick={handleClick}
    >
      {isGenerating ? 'Generating Ads...' : `Generate ${imageCount > 1 ? `${imageCount} Ads` : 'Ad'}`}
    </Button>
  );
};
