import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { capturePreview } from "@/utils/adPreviewCapture";
import { getDimensions } from "@/utils/adDimensions";
import { format } from 'date-fns';

interface AdSubmissionHandlerProps {
  adData: any;
  selectedImage: File | string;
  previewRef: React.RefObject<HTMLDivElement>;
  onSuccess: (newAd: any) => void;
  setIsGenerating: (value: boolean) => void;
}

const CORS_PROXIES = [
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
];

async function fetchWithRetry(url: string): Promise<Response> {
  let lastError;
  
  for (const proxyFn of CORS_PROXIES) {
    try {
      const proxyUrl = proxyFn(url);
      console.log('Attempting to fetch with proxy:', proxyUrl);
      const response = await fetch(proxyUrl);
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.error('Proxy fetch failed:', error);
      lastError = error;
    }
  }

  try {
    const response = await fetch(url);
    if (response.ok) {
      return response;
    }
  } catch (error) {
    lastError = error;
  }

  throw lastError || new Error('Failed to fetch image after all attempts');
}

function generateAdName(adData: any) {
  const today = format(new Date(), 'ddMMyy');
  const baseName = adData.name.toLowerCase().replace(/\s+/g, '-');
  const platform = adData.platform || 'unknown';
  const language = 'he'; // Default to Hebrew
  const template = adData.template_style || 'modern';
  const color = adData.accent_color.replace('#', '');
  const font = adData.font_url.split('family=')[1]?.split(':')[0]?.replace(/\+/g, '-').toLowerCase() || 'default';
  
  return `${today}-${baseName}-${platform}-${language}-${template}-${color}-${font}`
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
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
    const timestamp = Date.now() + Math.floor(Math.random() * 1000);
    
    console.log('Starting ad generation process with data:', { adData, width, height });
    
    let imageBlob: Blob;
    if (selectedImage instanceof File) {
      imageBlob = selectedImage;
    } else {
      console.log('Fetching image from URL:', selectedImage);
      const response = await fetchWithRetry(selectedImage);
      imageBlob = await response.blob();
    }
    
    const originalImagePath = `original/${timestamp}_${selectedImage instanceof File ? selectedImage.name : 'image.jpg'}`;
    const { error: originalUploadError, data: originalUploadData } = await supabase.storage
      .from('ad-images')
      .upload(originalImagePath, imageBlob, {
        cacheControl: '3600',
        upsert: true
      });

    if (originalUploadError) {
      console.error('Original image upload error:', originalUploadError);
      throw new Error('Failed to upload original image');
    }

    console.log('Original image uploaded successfully:', originalUploadData);
    
    const previewFile = await capturePreview(previewRef, adData.platform);
    if (!previewFile) {
      console.error('Preview capture failed - no file returned');
      throw new Error('Failed to capture preview');
    }

    console.log('Preview captured successfully, uploading to storage...');
    const previewPath = `generated/${timestamp}_preview.png`;
    
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

    const { data: { publicUrl: previewUrl } } = supabase.storage
      .from('ad-images')
      .getPublicUrl(previewPath);

    console.log('Got public URL for preview:', previewUrl);

    // Ensure template_style is one of the allowed values
    const validTemplateStyles = ['modern', 'elegant', 'dynamic', 'spotlight', 'wave', 'cinematic', 'minimal-fade', 'duotone', 'vignette'];
    const templateStyle = validTemplateStyles.includes(adData.template_style) ? adData.template_style : 'modern';
    
    const adName = generateAdName(adData);
    const { data: newAd, error: createError } = await supabase
      .from('generated_ads')
      .insert([{
        name: adName,
        headline: adData.headline,
        cta_text: adData.cta_text,
        font_url: adData.font_url,
        platform: adData.platform,
        template_style: templateStyle,
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
