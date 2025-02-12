
import { toast } from "sonner";
import { getDimensions } from "./adDimensions";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from 'html2canvas';
import { applyImageEffect } from "./imageEffects";

interface Position {
  x: number;
  y: number;
}

interface AdPositions {
  headlinePosition: Position;
  descriptionPosition: Position;
  ctaPosition: Position;
  imagePosition: Position;
}

export const processImages = async (
  adData: any,
  images: (File | string)[],
  previewRef: React.RefObject<HTMLDivElement>,
  onAdGenerated: (adData: any) => void,
  handleSubmission: any,
  setIsGenerating: (value: boolean) => void,
  positions: AdPositions // Add positions parameter
) => {
  console.log("Starting to process images:", images.length);
  console.log("Using positions:", positions); // Log positions for debugging
  let successCount = 0;
  
  for (let i = 0; i < images.length; i++) {
    const currentImage = images[i];
    console.log(`Processing image ${i + 1}/${images.length}`);

    try {
      if (!previewRef.current) {
        throw new Error('Preview element not found');
      }

      const canvas = await html2canvas(previewRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2,
        logging: true,
      });

      const finalImageUrl = await applyImageEffect(canvas, adData.effect || 'none');

      const response = await fetch(finalImageUrl);
      const previewBlob = await response.blob();

      const previewPath = `previews/${crypto.randomUUID()}.jpg`;
      const { error: previewUploadError } = await supabase.storage
        .from('ad-images')
        .upload(previewPath, previewBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (previewUploadError) {
        throw new Error(`Failed to upload preview: ${previewUploadError.message}`);
      }

      const { data: { publicUrl: previewUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(previewPath);

      let imageUrl: string;
      let imageBlob: Blob;
      
      if (typeof currentImage === 'string') {
        const response = await fetch(currentImage);
        if (!response.ok) {
          throw new Error(`Failed to access image URL: ${currentImage}`);
        }
        imageBlob = await response.blob();
        imageUrl = currentImage;
      } else {
        imageBlob = currentImage;
        imageUrl = await handleSubmission(currentImage);
      }

      if (!imageUrl) {
        throw new Error('No image URL generated');
      }

      const { width, height } = getDimensions(adData.platform);

      // Merge positions with adData
      const enrichedData = {
        ...adData,
        width,
        height,
        headlinePosition: positions.headlinePosition,
        descriptionPosition: positions.descriptionPosition,
        ctaPosition: positions.ctaPosition,
        imagePosition: positions.imagePosition
      };

      const formData = new FormData();
      formData.append('image', imageBlob);
      formData.append('data', JSON.stringify(enrichedData));

      const { data: generatedData, error: generateError } = await supabase.functions
        .invoke('generate-ad', {
          body: formData
        });

      if (generateError) {
        throw generateError;
      }

      if (!generatedData?.imageUrl) {
        throw new Error('No generated image URL received');
      }

      const enrichedAdData = {
        name: `${adData.headline || 'Untitled'} - Version ${i + 1}`,
        headline: adData.headline,
        description: adData.description,
        cta_text: adData.cta_text,
        font_url: adData.font_url,
        platform: adData.platform,
        template_style: adData.template_style || 'modern',
        accent_color: adData.accent_color || '#4A90E2',
        cta_color: adData.cta_color || '#4A90E2',
        overlay_color: adData.overlay_color || '#000000',
        text_color: adData.text_color || '#FFFFFF',
        description_color: adData.description_color || '#333333',
        image_url: imageUrl,
        preview_url: previewUrl,
        effect: adData.effect || 'none',
        width,
        height,
        status: 'completed'
      };

      const { data: insertedAd, error: insertError } = await supabase
        .from('generated_ads')
        .insert([enrichedAdData])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      if (insertedAd) {
        successCount++;
        onAdGenerated(insertedAd);
        console.log(`Successfully inserted ad ${i + 1}`);
      }

    } catch (error) {
      console.error(`Error processing image ${i + 1}:`, error);
      toast.error(`Failed to process image ${i + 1}: ${error.message}`);
    }
  }
  
  if (successCount > 0) {
    toast.success(`Successfully created ${successCount} ads!`);
  } else {
    toast.error('No ads were created. Please check the errors and try again.');
  }
};
