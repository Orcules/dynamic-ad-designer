
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

        // Upload to Supabase
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('ad-images')
          .upload(`generated/${Date.now()}_${i}_ad.png`, previewFile, {
            contentType: 'image/png',
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl: generatedImageUrl } } = supabase.storage
          .from('ad-images')
          .getPublicUrl(uploadData.path);

        // Generate enriched ad data
        const enrichedAdData = enrichAdData(adData, i);
        enrichedAdData.imageUrl = generatedImageUrl;

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
