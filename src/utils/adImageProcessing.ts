
import { toast } from "sonner";
import { enrichAdData } from "./adEnrichment";
import { capturePreview } from "./adPreviewCapture";

export const processImages = async (
  adData: any,
  images: (File | string)[],
  previewRef: React.RefObject<HTMLDivElement>,
  onAdGenerated: (adData: any) => void,
  handleSubmission: (file: File) => Promise<string>,
  setIsGenerating: (value: boolean) => void
) => {
  try {
    console.log('Starting preview capture process...');
    const previewContainer = previewRef.current;
    
    if (!previewContainer) {
      throw new Error('Preview container not found');
    }

    // Process each image sequentially to ensure proper rendering
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (typeof image !== 'string') continue;

      try {
        // Ensure styles are applied before capturing
        await new Promise(resolve => setTimeout(resolve, 100));

        // Capture preview
        const previewFile = await capturePreview(previewRef, 'default');
        if (!previewFile) {
          throw new Error('Failed to capture preview');
        }

        // Upload using the provided handleSubmission function
        const generatedImageUrl = await handleSubmission(previewFile);

        // Generate enriched ad data with positions
        const enrichedAdData = enrichAdData(adData, i);
        enrichedAdData.imageUrl = generatedImageUrl;
        
        // Include element positions in the enriched data
        enrichedAdData.positions = {
          headlinePosition: adData.headlinePosition,
          descriptionPosition: adData.descriptionPosition,
          ctaPosition: adData.ctaPosition,
          imagePosition: adData.imagePosition
        };

        onAdGenerated(enrichedAdData);

        console.log(`Successfully processed ad ${i + 1} of ${images.length}`);
      } catch (error) {
        console.error(`Error processing image ${i}:`, error);
        throw error;
      }
    }

    toast.success('Ads created successfully!');

  } catch (error) {
    console.error('Error processing images:', error);
    toast.error('Error creating ads');
  } finally {
    setIsGenerating(false);
  }
};
