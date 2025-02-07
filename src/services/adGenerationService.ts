
import { supabase } from "@/integrations/supabase/client";
import { generateAdName, validTemplateStyles } from "@/utils/adSubmissionUtils";
import { getDimensions } from "@/utils/adDimensions";

export interface GeneratedAdResult {
  imageUrl: string;
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

    return generatedAd;
  }

  static async saveAdToDatabase(adData: any, imageUrl: string): Promise<any> {
    const { width, height } = getDimensions(adData.platform);
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
        image_url: imageUrl,
        status: 'completed'
      }])
      .select()
      .single();

    if (createError) {
      console.error('Create ad record error:', createError);
      throw new Error('Failed to create ad record');
    }

    return newAd;
  }
}
