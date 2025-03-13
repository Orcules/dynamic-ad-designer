
import { supabase } from '@/integrations/supabase/client';
import { Logger } from '@/utils/logger';

interface EdgeFunctionOptions {
  image: File;
  renderedPreview?: string;
  width?: number;
  height?: number;
  headline?: string;
  language?: string;
  fontName?: string;
  aspectRatio?: string;
  templateStyle?: string;
  version?: number;
}

export class EdgeFunctionService {
  /**
   * Call the generate-ad edge function
   */
  static async generateAd(options: EdgeFunctionOptions): Promise<{ imageUrl?: string; error?: string }> {
    try {
      Logger.info('Using edge function to generate the ad');
      
      const formData = new FormData();
      formData.append('image', options.image);
      
      if (options.renderedPreview) {
        formData.append('renderedPreview', options.renderedPreview);
      }
      
      formData.append('data', JSON.stringify({
        width: options.width || 1200,
        height: options.height || 628,
        fastMode: true,
        headline: options.headline,
        language: options.language,
        fontName: options.fontName,
        aspectRatio: options.aspectRatio,
        templateStyle: options.templateStyle,
        version: options.version
      }));
      
      const { data, error } = await supabase.functions.invoke('generate-ad', {
        body: formData
      });
      
      if (error) {
        Logger.error(`Edge function error: ${error.message}`);
        return { error: `Edge function failed: ${error.message}` };
      }
      
      if (data?.imageUrl) {
        Logger.info(`Successfully generated ad via edge function: ${data.imageUrl}`);
        return { imageUrl: data.imageUrl };
      } else {
        return { error: 'No image URL returned from edge function' };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.error(`Edge function processing failed: ${errorMsg}`);
      return { error: errorMsg };
    }
  }
}
