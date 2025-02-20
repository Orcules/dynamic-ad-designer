
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
    const imageGenerator = new ImageGenerator('.ad-content');
    try {
      // קודם נשמור את התמונה הנוכחית
      const currentImageUrl = await imageGenerator.getImageUrl();
      
      // נקרא לפונקציה המקורית שמעדכנת את הסטייט ומבצעת את השמירה בדאטאבייס
      onClick(e);
      
    } catch (error) {
      console.error('Error generating image:', error);
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
