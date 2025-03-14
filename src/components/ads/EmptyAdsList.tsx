
import React from 'react';
import { Button } from "@/components/ui/button";

interface EmptyAdsListProps {
  onRetryLoad?: () => void;
}

export const EmptyAdsList: React.FC<EmptyAdsListProps> = ({ onRetryLoad }) => {
  return (
    <div className="text-center p-8 border border-dashed rounded-lg">
      <p className="text-muted-foreground">No ads created yet</p>
      <p className="text-sm text-muted-foreground mt-2">
        Ads you create will appear here
      </p>
      {onRetryLoad && (
        <Button variant="outline" className="mt-4" onClick={onRetryLoad}>
          Refresh Ads
        </Button>
      )}
    </div>
  );
};
