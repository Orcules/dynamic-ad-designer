
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface AdDownloadButtonProps {
  isCapturing: boolean;
  onClick: () => void;
}

export const AdDownloadButton: React.FC<AdDownloadButtonProps> = ({
  isCapturing,
  onClick
}) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onClick}
      className="flex items-center gap-2"
      disabled={isCapturing}
    >
      <Download className="h-4 w-4" />
      {isCapturing ? 'Generating...' : 'Download Preview'}
    </Button>
  );
};
