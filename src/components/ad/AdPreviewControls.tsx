
import React from 'react';
import { Checkbox } from "../ui/checkbox";

interface AdPreviewControlsProps {
  showCtaArrow: boolean;
  onShowCtaArrowChange: (checked: boolean) => void;
}

export const AdPreviewControls: React.FC<AdPreviewControlsProps> = ({
  showCtaArrow,
  onShowCtaArrowChange
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="show-cta-arrow"
          checked={showCtaArrow}
          onCheckedChange={(checked) => onShowCtaArrowChange(checked as boolean)}
        />
        <label
          htmlFor="show-cta-arrow"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Show CTA Arrow
        </label>
      </div>
    </div>
  );
};
