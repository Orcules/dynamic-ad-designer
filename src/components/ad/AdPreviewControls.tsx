
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
  // Use useCallback to stabilize the handler
  const handleCheckedChange = useCallback((checked: boolean) => {
    // Use timeout to prevent UI freeze
    setTimeout(() => {
      onShowCtaArrowChange(checked);
    }, 0);
  }, [onShowCtaArrowChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="show-cta-arrow"
          checked={showCtaArrow}
          onCheckedChange={(checked) => handleCheckedChange(checked as boolean)}
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
