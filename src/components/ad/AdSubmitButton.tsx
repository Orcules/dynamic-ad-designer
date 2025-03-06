
import React from 'react';
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface AdSubmitButtonProps {
  isGenerating: boolean;
  onClick: (e: React.MouseEvent) => void;
  imageCount?: number;
  currentProcessingIndex?: number;
}

export const AdSubmitButton: React.FC<AdSubmitButtonProps> = ({
  isGenerating,
  onClick,
  imageCount = 0,
  currentProcessingIndex = 0
}) => {
  const getButtonText = () => {
    if (!isGenerating) {
      return `Generate ${imageCount > 1 ? `${imageCount} Ads` : 'Ad'}`;
    }
    
    if (imageCount > 1) {
      return `Generating Ad ${currentProcessingIndex + 1}/${imageCount}...`;
    }
    
    return 'Generating Ad...';
  };

  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={isGenerating} 
      onClick={onClick}
    >
      {isGenerating && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {getButtonText()}
    </Button>
  );
};
