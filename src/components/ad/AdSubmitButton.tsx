
import React from 'react';
import { Button } from "../ui/button";

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
  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={isGenerating} 
      onClick={onClick}
    >
      {isGenerating ? 'Generating Ads...' : `Generate ${imageCount > 1 ? `${imageCount} Ads` : 'Ad'}`}
    </Button>
  );
};
