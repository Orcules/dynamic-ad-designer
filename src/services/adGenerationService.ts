
import { supabase } from "@/integrations/supabase/client";
import { getDimensions } from "@/utils/adDimensions";
import { cleanImageUrl, extractImageMetadata } from "@/utils/imageEffects";

export interface GeneratedAdResult {
  imageUrl: string;
  previewUrl?: string;
  adData: any;
}

export class AdGenerationService {
  static async generateAd(adData: any, imageBlob: Blob): Promise<GeneratedAdResult> {
    const formData = new FormData();
    
    // בדיקה שה-blob הוא תקין ויצירת קובץ ממנו
    const imageFile = new File([imageBlob], 'image.png', { type: 'image/png' });
    formData.append('image', imageFile);
    
    // Extract metadata if it exists in the DataURL
    let scaleFactor = 2; // Default scale factor
    let elementDimensions = null;
    
    // Check if the source image URL has metadata
    if (adData.sourceImageUrl) {
      try {
        // Extract metadata using the helper function
        const metadata = extractImageMetadata(adData.sourceImageUrl);
        if (metadata) {
          elementDimensions = metadata;
          scaleFactor = metadata.scaleFactor || 2;
          console.log('Extracted metadata:', elementDimensions);
        }
      } catch (error) {
        console.warn('Failed to parse image metadata:', error);
      }
    }
    
    // Clean the source image URL before sending
    if (adData.sourceImageUrl) {
      adData.cleanSourceImageUrl = cleanImageUrl(adData.sourceImageUrl);
    }
    
    formData.append('data', JSON.stringify({
      ...adData,
      ...getDimensions(adData.platform),
      overlayOpacity: 0.4,
      scaleFactor,
      elementDimensions
    }));

    console.log('Sending to edge function:', {
      imageType: imageFile.type,
      imageSize: imageFile.size,
      data: adData,
      scaleFactor
    });

    // Fix: Pass a single options object to the invoke method
    const { data: generatedAd, error: generateError } = await supabase.functions
      .invoke('generate-ad', {
        body: formData
      });

    if (generateError) {
      console.error('Generate ad error:', generateError);
      throw new Error('Failed to generate ad');
    }

    // Process the generated URL to ensure it doesn't have metadata
    let imageUrl = generatedAd.imageUrl;
    if (imageUrl) {
      imageUrl = cleanImageUrl(imageUrl);
      generatedAd.imageUrl = imageUrl;
    }

    // Also clean previewUrl if it exists
    if (generatedAd.previewUrl) {
      generatedAd.previewUrl = cleanImageUrl(generatedAd.previewUrl);
    }

    return {
      ...generatedAd,
      adData
    };
  }
}
