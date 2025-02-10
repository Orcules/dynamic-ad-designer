import { toast } from "sonner";
import { enrichAdData } from "./adEnrichment";

export const processImages = async (
  adData: any,
  images: (File | string)[],
  previewRef: React.RefObject<HTMLDivElement>,
  onAdGenerated: (adData: any) => void,
  handleSubmission: any,
  setIsGenerating: (value: boolean) => void
) => {
  for (let i = 0; i < images.length; i++) {
    const currentImage = images[i];
    const enrichedAdData = enrichAdData(adData, i);
    
    try {
      await handleSubmission(
        enrichedAdData,
        currentImage,
        previewRef,
        onAdGenerated,
        setIsGenerating
      );
    } catch (error) {
      console.error(`Error processing image ${i + 1}:`, error);
      toast.error(`Error processing image ${i + 1}`);
    }
  }
};