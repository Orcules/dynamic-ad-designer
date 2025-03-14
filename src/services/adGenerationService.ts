
import { supabase } from "@/integrations/supabase/client";
import { getDimensions } from "@/utils/adDimensions";
import { Logger } from "@/utils/logger";
import { ImageGenerator } from "@/utils/ImageGenerator";

export interface GeneratedAdResult {
  imageUrl: string;
  previewUrl?: string;
  adData: any;
}

export class AdGenerationService {
  static async generateAd(adData: any, imageBlob: Blob): Promise<GeneratedAdResult> {
    try {
      const formData = new FormData();
      
      // בדיקה שה-blob הוא תקין ויצירת קובץ ממנו
      const imageFile = new File([imageBlob], 'image.png', { type: 'image/png' });
      formData.append('image', imageFile);
      
      formData.append('data', JSON.stringify({
        ...adData,
        ...getDimensions(adData.platform),
        overlayOpacity: 0.4
      }));

      Logger.info('Sending to edge function:', {
        imageType: imageFile.type,
        imageSize: imageFile.size,
        data: adData
      });

      // Fix: supabase.functions.invoke only takes a single options object
      const { data: generatedAd, error: generateError } = await supabase.functions
        .invoke('generate-ad', {
          body: formData
        });

      if (generateError) {
        Logger.error('Generate ad error:', generateError);
        throw new Error('Failed to generate ad');
      }

      return {
        ...generatedAd,
        adData
      };
    } catch (error) {
      Logger.error('Error generating ad:', error);
      throw error;
    }
  }
  
  static fixGradientIssues(element: HTMLElement): void {
    // Find and fix any gradient-related issues in the DOM
    const gradientElements = element.querySelectorAll('[style*="gradient"]');
    gradientElements.forEach(el => {
      if (el instanceof HTMLElement) {
        const backgroundImage = el.style.backgroundImage;
        // Check for NaN, Infinity, undefined in gradients
        if (backgroundImage.includes('gradient') && 
            (backgroundImage.includes('NaN') || 
             backgroundImage.includes('Infinity') || 
             backgroundImage.includes('undefined'))) {
          // Replace problematic gradient with a simple color
          el.style.backgroundImage = 'none';
          el.style.backgroundColor = '#ffffff'; // Use white as fallback
        }
      }
    });
  }
}
