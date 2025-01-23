import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { capturePreview } from "@/utils/adPreviewCapture";
import { getDimensions } from "@/utils/adDimensions";

interface AdSubmissionHandlerProps {
  adData: any;
  selectedImage: File | null;
  previewRef: React.RefObject<HTMLDivElement>;
  onSuccess: (newAd: any) => void;
  setIsGenerating: (value: boolean) => void;
}

export const handleAdSubmission = async ({
  adData,
  selectedImage,
  previewRef,
  onSuccess,
  setIsGenerating,
}: AdSubmissionHandlerProps) => {
  if (!selectedImage) {
    toast.error('נא לבחור תמונה');
    return;
  }
  
  setIsGenerating(true);
  
  try {
    const { width, height } = getDimensions(adData.platform);
    const timestamp = Date.now();
    
    console.log('Starting ad generation process with data:', { adData, width, height });
    
    // Upload the original image first
    const originalImagePath = `original/${timestamp}_${selectedImage.name}`;
    const { error: originalUploadError, data: originalUploadData } = await supabase.storage
      .from('ad-images')
      .upload(originalImagePath, selectedImage, {
        cacheControl: '3600',
        upsert: true
      });

    if (originalUploadError) {
      console.error('Original image upload error:', originalUploadError);
      throw new Error('Failed to upload original image');
    }

    console.log('Original image uploaded successfully:', originalUploadData);
    
    // Capture the exact preview as shown
    const previewFile = await capturePreview(previewRef, adData.platform);
    if (!previewFile) {
      console.error('Preview capture failed - no file returned');
      throw new Error('Failed to capture preview');
    }

    console.log('Preview captured successfully, uploading to storage...');
    const previewPath = `generated/${timestamp}_preview.png`;
    
    // Upload the preview image
    const { error: previewError, data: previewUploadData } = await supabase.storage
      .from('ad-images')
      .upload(previewPath, previewFile, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true
      });

    if (previewError) {
      console.error('Preview upload error:', previewError);
      throw new Error('Failed to upload preview');
    }

    console.log('Preview uploaded successfully:', previewUploadData);

    // Get the public URL for the preview image
    const { data: { publicUrl: previewUrl } } = supabase.storage
      .from('ad-images')
      .getPublicUrl(previewPath);

    console.log('Got public URL for preview:', previewUrl);
    
    // Create ad record with the exact preview image
    const { data: newAd, error: createError } = await supabase
      .from('generated_ads')
      .insert([{
        name: adData.name,
        headline: adData.headline,
        cta_text: adData.cta_text,
        font_url: adData.font_url,
        platform: adData.platform,
        template_style: adData.template_style || 'minimal',
        accent_color: adData.accent_color,
        width,
        height,
        image_url: previewUrl,
        status: 'completed'
      }])
      .select()
      .single();

    if (createError) {
      console.error('Create ad record error:', createError);
      throw new Error('Failed to create ad record');
    }

    console.log('Ad record created successfully:', newAd);
    
    toast.success('המודעה נוצרה בהצלחה!', {
      action: {
        label: 'צפה במודעה',
        onClick: () => window.open(previewUrl, '_blank')
      },
    });
    
    onSuccess(newAd);
    
  } catch (error: any) {
    console.error('Error in handleAdSubmission:', error);
    toast.error(error.message || 'אירעה שגיאה ביצירת המודעה');
  } finally {
    setIsGenerating(false);
  }
};