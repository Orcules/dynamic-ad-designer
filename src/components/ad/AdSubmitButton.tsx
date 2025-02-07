import React from 'react';
import { Button } from "../ui/button";

interface AdSubmitButtonProps {
  isGenerating: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const AdSubmitButton: React.FC<AdSubmitButtonProps> = ({
  isGenerating,
  onClick
}) => {
  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={isGenerating} 
      onClick={onClick}
    >
      {isGenerating ? 'Generating Ad...' : 'Generate Ad'}
    </Button>
  );
};