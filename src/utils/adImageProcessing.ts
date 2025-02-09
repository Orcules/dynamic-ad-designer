
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
      const adUrl = await handleSubmission(
        enrichedAdData,
        currentImage,
        previewRef,
        onAdGenerated,
        setIsGenerating
      );
      
      if (adUrl) {
        toast.success('המודעה נוצרה בהצלחה!', {
          action: {
            label: 'צפה במודעה',
            onClick: () => window.open(adUrl, '_blank')
          }
        });
      }
    } catch (error) {
      console.error(`שגיאה בעיבוד תמונה ${i + 1}:`, error);
      toast.error(`שגיאה בעיבוד תמונה ${i + 1}`);
    }
  }
};
