
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
    
    console.log('Preview captured successfully, uploading...');
    
    // Upload to Supabase first
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ad-images')
      .upload(`generated/${Date.now()}_ad.png`, previewFile, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload preview: ${uploadError.message}`);
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl: generatedImageUrl } } = supabase.storage
      .from('ad-images')
      .getPublicUrl(uploadData.path);

    console.log('Preview uploaded successfully:', generatedImageUrl);

    // Also create a local URL for immediate preview
    const previewUrl = URL.createObjectURL(previewFile);
    console.log('Local preview URL created:', previewUrl);

    // Create ad record with the Supabase URL
    const enrichedAdData = enrichAdData(adData, 0);
    enrichedAdData.imageUrl = generatedImageUrl; // Use Supabase URL for storage

    onAdGenerated(enrichedAdData);
    
    // Open preview immediately using the local URL
    window.open(previewUrl, '_blank');
    
    toast.success('Ad created successfully!', {
      action: {
        label: 'View Ad',
        onClick: () => window.open(generatedImageUrl, '_blank')
      }
    });
    
  } catch (error) {
    console.error('Error processing image:', error);
    toast.error('Error creating ad');
  } finally {
    setIsGenerating(false);
  }
};

