
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
    const response = await fetch(url, { mode: 'no-cors' });
    return response;
  } catch (error) {
    lastError = error;
  }

  throw lastError || new Error('Failed to fetch image after all attempts');
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function generateAdName(adData: any) {
  const date = format(new Date(), 'ddMMyy');
  const name = adData.name.toLowerCase().replace(/\s+/g, '-');
  const platform = adData.platform || 'unknown';
  const language = adData.language || 'en';
  const templateStyle = adData.template_style || 'modern';
  const accentColor = adData.accent_color.replace('#', '');
  const font = adData.font_url.split('family=')[1]?.split(':')[0]?.replace(/\+/g, '-').toLowerCase() || 'default';
  
  const adName = `${date}-${name}-${platform}-${language}-${templateStyle}-${accentColor}-${font}`;
  
  return adName
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const validTemplateStyles = [
  'modern', 'elegant', 'dynamic', 'spotlight', 'wave', 
  'cinematic', 'minimal-fade', 'duotone', 'vignette', 'luxury',
  'overlay-bottom-clean', 'overlay-bottom-gradient', 'overlay-bottom-glass',
  'overlay-bottom-neon', 'overlay-bottom-minimal', 'neon', 'split',
  'gradient', 'outline', 'stacked', 'minimal', 'retro', 'glassmorphism',
  '3d', 'vintage', 'tech', 'nature', 'urban', 'artistic'
];

export const handleAdSubmission = async ({
  adData,
  selectedImage,
  previewRef,
  onSuccess,
  setIsGenerating,
}: AdSubmissionHandlerProps) => {
  if (!selectedImage) {
    toast.error('Please select an image');
    return;
  }

  // יצירת מזהה ייחודי לכל העלאה
  const uploadId = crypto.randomUUID();
  const timestamp = Date.now();
  
  setIsGenerating(true);
  let uploadedFiles: string[] = [];
  
  try {
    console.log(`Starting ad generation process [${uploadId}]`, { adData });
    const { width, height } = getDimensions(adData.platform);
    
    // הכנת התמונה
    let imageBlob: Blob;
    if (selectedImage instanceof File) {
      imageBlob = selectedImage;
      console.log(`Using uploaded file [${uploadId}]`);
    } else {
      console.log(`Fetching image from URL [${uploadId}]:`, selectedImage);
      const response = await fetchWithRetry(selectedImage);
      imageBlob = await response.blob();
      console.log(`Successfully fetched image [${uploadId}]`);
    }
    
    // העלאת התמונה המקורית
    const originalFileName = selectedImage instanceof File ? selectedImage.name : 'image.jpg';
    const sanitizedFileName = sanitizeFileName(originalFileName);
    const originalImagePath = `original/${uploadId}_${timestamp}_${sanitizedFileName}`;
    
    console.log(`Uploading original image [${uploadId}] to ${originalImagePath}`);
    const { error: originalUploadError } = await supabase.storage
      .from('ad-images')
      .upload(originalImagePath, imageBlob, {
        cacheControl: '3600',
        upsert: false
      });

    if (originalUploadError) {
      console.error(`Original image upload error [${uploadId}]:`, originalUploadError);
      throw new Error('Failed to upload original image');
    }

    uploadedFiles.push(originalImagePath);
    console.log(`Original image uploaded successfully [${uploadId}]`);
    
    // יצירת תצוגה מקדימה
    console.log(`Capturing preview [${uploadId}]`);
    const previewFile = await capturePreview(previewRef, adData.platform);
    if (!previewFile) {
      throw new Error('Failed to capture preview');
    }

    const previewPath = `generated/${uploadId}_${timestamp}_preview.png`;
    console.log(`Uploading preview [${uploadId}] to ${previewPath}`);
    
    const { error: previewError } = await supabase.storage
      .from('ad-images')
      .upload(previewPath, previewFile, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (previewError) {
      console.error(`Preview upload error [${uploadId}]:`, previewError);
      throw new Error('Failed to upload preview');
    }

    uploadedFiles.push(previewPath);
    console.log(`Preview uploaded successfully [${uploadId}]`);

    // קריאה לפונקציית Edge
    const formData = new FormData();
    formData.append('image', imageBlob);
    formData.append('uploadId', uploadId);
    formData.append('data', JSON.stringify({
      ...adData,
      width,
      height,
      overlayOpacity: 0.4
    }));

    console.log(`Calling generate-ad edge function [${uploadId}]`);
    const { data: generatedAd, error: generateError } = await supabase.functions
      .invoke('generate-ad', {
        body: formData
      });

    if (generateError) {
      console.error(`Generate ad error [${uploadId}]:`, generateError);
      throw new Error('Failed to generate ad');
    }

    console.log(`Ad generated successfully [${uploadId}]:`, generatedAd);

    // שמירת המודעה במסד הנתונים
    const templateStyle = validTemplateStyles.includes(adData.template_style) 
      ? adData.template_style 
      : 'modern';
    
    const adName = generateAdName(adData);
    const { data: newAd, error: createError } = await supabase
      .from('generated_ads')
      .insert([{
        name: adName,
        headline: adData.headline,
        description: adData.description,
        cta_text: adData.cta_text,
        font_url: adData.font_url,
        platform: adData.platform,
        template_style: templateStyle,
        accent_color: adData.accent_color,
        cta_color: adData.cta_color,
        overlay_color: adData.overlay_color,
        text_color: adData.text_color,
        description_color: adData.description_color,
        width,
        height,
        image_url: generatedAd.imageUrl,
        status: 'completed'
      }])
      .select()
      .single();

    if (createError) {
      console.error(`Create ad record error [${uploadId}]:`, createError);
      throw new Error('Failed to create ad record');
    }

    console.log(`Ad record created successfully [${uploadId}]:`, newAd);
    
    toast.success('Ad created successfully!', {
      action: {
        label: 'View Ad',
        onClick: () => window.open(generatedAd.imageUrl, '_blank')
      },
    });
    
    onSuccess(newAd);
    
  } catch (error: any) {
    console.error(`Error in handleAdSubmission [${uploadId}]:`, error);
    
    // ניקוי קבצים שהועלו במקרה של שגיאה
    if (uploadedFiles.length > 0) {
      console.log(`Cleaning up uploaded files [${uploadId}]...`);
      await Promise.all(
        uploadedFiles.map(async (filePath) => {
          const { error } = await supabase.storage
            .from('ad-images')
            .remove([filePath]);
          if (error) {
            console.error(`Failed to remove file ${filePath} [${uploadId}]:`, error);
          }
        })
      );
    }
    
    toast.error(error.message || 'Error creating ad');
  } finally {
    setIsGenerating(false);
  }
};
