
import { toast } from "sonner";
import { enrichAdData } from "./adEnrichment";
import { capturePreview } from "./adPreviewCapture";

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

    const { data: { publicUrl: generatedImageUrl } } = supabase.storage
      .from('ad-images')
      .getPublicUrl(uploadData.path);

    console.log('Preview uploaded successfully:', generatedImageUrl);

    // Create ad record with the preview URL
    const enrichedAdData = enrichAdData(adData, 0);
    enrichedAdData.imageUrl = generatedImageUrl;

    onAdGenerated(enrichedAdData);
    
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
