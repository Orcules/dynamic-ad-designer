
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export class StorageManager {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  async uploadOriginalImage(uploadId: string, image: any) {
    const timestamp = Date.now();
    const originalFileName = `original/${uploadId}_${timestamp}.jpg`;
    
    const { error: uploadError } = await this.supabase.storage
      .from('ad-images')
      .upload(originalFileName, image, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error('Failed to upload original image');
    }

    const { data: { publicUrl: originalImageUrl } } = this.supabase.storage
      .from('ad-images')
      .getPublicUrl(originalFileName);

    return { originalFileName, originalImageUrl };
  }

  async uploadGeneratedImage(uploadId: string, screenshotBuffer: Uint8Array) {
    const timestamp = Date.now();
    const generatedFileName = `generated/${uploadId}_${timestamp}.jpg`;
    
    const { error: saveError } = await this.supabase.storage
      .from('ad-images')
      .upload(generatedFileName, screenshotBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (saveError) {
      throw new Error('Failed to save generated image');
    }

    const { data: { publicUrl: generatedImageUrl } } = this.supabase.storage
      .from('ad-images')
      .getPublicUrl(generatedFileName);

    return { generatedFileName, generatedImageUrl };
  }
}
