
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
  console.log("Starting to process images:", images.length);
  
  for (let i = 0; i < images.length; i++) {
    const currentImage = images[i];
    console.log(`Processing image ${i + 1}/${images.length}`);
    
    // Create a unique name for each ad based on the original data
    const enrichedAdData = {
      ...adData,
      name: `${adData.headline || 'Untitled'} - Version ${i + 1}`,
      imageUrl: typeof currentImage === 'string' ? currentImage : null
    };
    
    try {
      await handleSubmission(
        enrichedAdData,
        currentImage,
        previewRef,
        onAdGenerated,
        setIsGenerating
      );
      console.log(`Successfully processed image ${i + 1}`);
    } catch (error) {
      console.error(`Error processing image ${i + 1}:`, error);
      toast.error(`Error processing image ${i + 1}`);
    }
  }
  
  toast.success(`Successfully created ${images.length} ads!`);
};
