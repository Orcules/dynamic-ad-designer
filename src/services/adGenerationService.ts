
import { supabase } from "@/integrations/supabase/client";
import { getDimensions } from "@/utils/adDimensions";
import { cleanImageUrl } from "@/utils/imageEffects";

export interface GeneratedAdResult {
  imageUrl: string;
  previewUrl?: string;
  adData: any;
}

export class AdGenerationService {
  static async generateAd(adData: any, imageBlob: Blob): Promise<GeneratedAdResult> {
    const formData = new FormData();
    
    // Create a proper file from the blob
    const imageFile = new File([imageBlob], 'image.png', { type: 'image/png' });
    formData.append('image', imageFile);
    
    // Extract metadata if it exists in the DataURL
    let scaleFactor = 2; // Default scale factor
    let elementDimensions = null;
    
    // Check if the source image URL has metadata
    if (adData.sourceImageUrl && adData.sourceImageUrl.includes('#metadata=')) {
      try {
        const metadataPart = adData.sourceImageUrl.split('#metadata=')[1];
        if (metadataPart) {
          const decodedMetadata = atob(metadataPart);
          elementDimensions = JSON.parse(decodedMetadata);
          scaleFactor = elementDimensions.scaleFactor || 2;
          console.log('Extracted metadata:', elementDimensions);
        }
      } catch (error) {
        console.warn('Failed to parse image metadata:', error);
      }
    }

    // Calculate dimensions based on platform
    const dimensions = getDimensions(adData.platform);
    
    // Add crop information to ensure correct aspect ratio
    const cropData = {
      ...adData,
      ...dimensions,
      overlayOpacity: 0.4,
      scaleFactor,
      elementDimensions,
      maintainAspectRatio: true, // Flag to ensure the backend maintains aspect ratio
    };
    
    formData.append('data', JSON.stringify(cropData));

    console.log('Sending to edge function:', {
      imageType: imageFile.type,
      imageSize: imageFile.size,
      data: cropData,
      scaleFactor
    });

    // Call the serverless function to generate the ad
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
    if (imageUrl && imageUrl.includes('#metadata=')) {
      imageUrl = cleanImageUrl(imageUrl);
      generatedAd.imageUrl = imageUrl;
    }

    return {
      ...generatedAd,
      adData
    };
  }
}
