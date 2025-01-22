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
    const fileExt = selectedImage.name.split('.').pop();
    const filePath = `uploads/${timestamp}.${fileExt}`;
    
    console.log('Starting ad generation process...');
    console.log('Capturing preview...');
    
    // Capture and upload preview
    const previewFile = await capturePreview(previewRef, adData.platform);
    if (!previewFile) {
      throw new Error('Failed to capture preview');
    }

    console.log('Preview captured, uploading to storage...');
    const previewPath = `generated/${timestamp}_preview.png`;
    const { error: previewError } = await supabase.storage
      .from('ad-images')
      .upload(previewPath, previewFile);

    if (previewError) {
      console.error('Preview upload error:', previewError);
      throw new Error('Failed to upload preview');
    }

    const { data: { publicUrl: previewUrl } } = supabase.storage
      .from('ad-images')
      .getPublicUrl(previewPath);

    console.log('Preview uploaded, creating ad record...');
    
    // Create ad record without specifying ID
    const { data: newAd, error: createError } = await supabase
      .from('generated_ads')
      .insert([{
        name: adData.name,
        headline: adData.headline,
        cta_text: adData.cta_text,
        font_url: adData.font_url,
        platform: adData.platform,
        template_style: adData.template_style,
        accent_color: adData.accent_color,
        width,
        height,
        image_url: previewUrl,
        status: 'completed'
      }])
      .select()
      .single();

    if (createError) {
      console.error('Create error:', createError);
      throw new Error('Failed to create ad record');
    }

    if (!newAd) {
      throw new Error('No ad record was created');
    }
    
    console.log('Ad created successfully:', newAd);
    
    toast.success('המודעה נוצרה בהצלחה!', {
      action: {
        label: 'הורד',
        onClick: () => window.open(previewUrl, '_blank')
      },
    });
    
    onSuccess(newAd);
    
  } catch (error) {
    console.error('Error creating ad:', error);
    toast.error(error.message || 'אירעה שגיאה ביצירת המודעה');
  } finally {
    setIsGenerating(false);
  }
};