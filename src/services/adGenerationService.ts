
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
    formData.append('image', imageBlob);
    formData.append('data', JSON.stringify({
      ...adData,
      ...getDimensions(adData.platform),
      overlayOpacity: 0.4
    }));

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
