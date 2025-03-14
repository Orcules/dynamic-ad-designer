
import { supabase } from "@/integrations/supabase/client";
import { getDimensions } from "@/utils/adDimensions";

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
    
    formData.append('data', JSON.stringify({
      ...adData,
      ...getDimensions(adData.platform),
      overlayOpacity: 0.4
    }));

    console.log('Sending to edge function:', {
      imageType: imageFile.type,
      imageSize: imageFile.size,
      data: adData
    });

    const { data: generatedAd, error: generateError } = await supabase.functions
      .invoke('generate-ad', {
        body: formData
      });

    if (generateError) {
      console.error('Generate ad error:', generateError);
      throw new Error('Failed to generate ad');
    }

    return {
      ...generatedAd,
      adData
    };
  }
}
