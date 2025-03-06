
import React, { useCallback } from 'react';
import { Checkbox } from "../ui/checkbox";

interface AdPreviewControlsProps {
  showCtaArrow: boolean;
  onShowCtaArrowChange: (checked: boolean) => void;
}

export const AdPreviewControls: React.FC<AdPreviewControlsProps> = ({
  showCtaArrow,
  onShowCtaArrowChange
}) => {
  const handleCheckedChange = useCallback((checked: boolean) => {
    requestAnimationFrame(() => {
      onShowCtaArrowChange(checked);
    });
  }, [onShowCtaArrowChange]);

  return (
    <div className="space-y-4 pointer-events-auto">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="show-cta-arrow"
          checked={showCtaArrow}
          onCheckedChange={(checked) => handleCheckedChange(checked as boolean)}
          className="pointer-events-auto"
        />
        <label
          htmlFor="show-cta-arrow"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer pointer-events-auto"
        >
          Show CTA Arrow
        </label>
      </div>
    </div>
  );
}
