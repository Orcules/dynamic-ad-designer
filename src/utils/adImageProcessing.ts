
import { toast } from "sonner";
import { enrichAdData } from "./adEnrichment";
import { capturePreview } from "./adPreviewCapture";
import { supabase } from "@/integrations/supabase/client";

export const processImages = async (
  adData: any,
  images: (File | string)[],
  previewRef: React.RefObject<HTMLDivElement>,
  onAdGenerated: (adData: any) => void,
  handleSubmission: any,
  setIsGenerating: (value: boolean) => void
) => {
  try {
    console.log('Starting preview capture process...');
    const previewFile = await capturePreview(previewRef, 'default');
    
    if (!previewFile) {
      throw new Error('Failed to capture preview');
    }
    
    console.log('Preview captured successfully');
    
    // Get the URL from the preview file
    const previewUrl = URL.createObjectURL(previewFile);
    console.log('Preview URL created:', previewUrl);

    // Create ad record with the preview URL
    const enrichedAdData = enrichAdData(adData, 0);
    enrichedAdData.imageUrl = previewUrl;

    onAdGenerated(enrichedAdData);
    
    // Open preview in new window
    window.open(previewUrl, '_blank');
    
    toast.success('Ad created successfully!', {
      action: {
        label: 'View Ad',
        onClick: () => window.open(previewUrl, '_blank')
      }
    });
    
  } catch (error) {
    console.error('Error processing image:', error);
    toast.error('Error creating ad');
  } finally {
    setIsGenerating(false);
  }
};
