
import { supabase } from "@/integrations/supabase/client";
import { getDimensions } from "@/utils/adDimensions";
import { cleanImageUrl } from "@/utils/imageEffects";
import { Logger } from "@/utils/logger";

export interface GeneratedAdResult {
  imageUrl: string;
  previewUrl?: string;
  adData: any;
}

export class AdGenerationService {
  static async generateAd(adData: any, imageBlob: Blob): Promise<GeneratedAdResult> {
    const formData = new FormData();
    
    // Create a file from the blob
    const imageFile = new File([imageBlob], 'image.png', { type: 'image/png' });
    formData.append('image', imageFile);
    
    // Extract metadata if it exists in the DataURL
    let scaleFactor = 2; // Default scale factor
    let elementDimensions = null;
    
    // Check if the source image URL has metadata
    if (adData.sourceImageUrl) {
      try {
        // Extract metadata from the URL if present
        const metadataMatch = adData.sourceImageUrl.match(/metadata=([^;]+)/);
        if (metadataMatch && metadataMatch[1]) {
          try {
            elementDimensions = JSON.parse(decodeURIComponent(metadataMatch[1]));
            scaleFactor = elementDimensions.scaleFactor || 2;
            Logger.info('Extracted metadata:', elementDimensions);
          } catch (parseError) {
            Logger.warn('Failed to parse metadata JSON:', parseError);
          }
        }
      } catch (error) {
        Logger.warn('Failed to parse image metadata:', error);
      }
    }
    
    // Clean the source image URL before sending
    if (adData.sourceImageUrl) {
      adData.cleanSourceImageUrl = cleanImageUrl(adData.sourceImageUrl);
    }
    
    // Get dimensions for the platform and make sure they're used consistently
    const platformDimensions = getDimensions(adData.platform);
    
    // Create image data with all required information
    const imageData = {
      ...adData,
      ...platformDimensions,
      overlayOpacity: 0.4,
      scaleFactor,
      elementDimensions,
      preserveAspectRatio: true, // Add flag to preserve aspect ratio
      originalDimensions: {
        width: platformDimensions.width,
        height: platformDimensions.height
      }
    };
    
    formData.append('data', JSON.stringify(imageData));

    Logger.info('Sending to edge function:', {
      imageType: imageFile.type,
      imageSize: imageFile.size,
      data: {
        ...adData,
        dimensions: platformDimensions,
        scaleFactor,
        preserveAspectRatio: true
      }
    });

    // Send the data to the edge function
    const { data: generatedAd, error: generateError } = await supabase.functions
      .invoke('generate-ad', {
        body: formData
      });

    if (generateError) {
      Logger.error('Generate ad error:', generateError);
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
