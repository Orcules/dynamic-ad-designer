
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
    const originalFileName = `full-ads/original/${uploadId}_${timestamp}.jpg`;
    
    // Use optimized upload settings
    const { error: uploadError } = await this.supabase.storage
      .from('ad-images')
      .upload(originalFileName, image, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true // Use upsert to override existing files with the same name
      });

    if (uploadError) {
      throw new Error(`Failed to upload original image: ${uploadError.message}`);
    }

    const { data: { publicUrl: originalImageUrl } } = this.supabase.storage
      .from('ad-images')
      .getPublicUrl(originalFileName);

    return { originalFileName, originalImageUrl };
  }

  async uploadGeneratedImage(uploadId: string, screenshotBuffer: Uint8Array) {
    const timestamp = Date.now();
    const generatedFileName = `full-ads/generated/${uploadId}_${timestamp}.jpg`;
    
    // Use optimized upload settings with higher compression
    const { error: saveError } = await this.supabase.storage
      .from('ad-images')
      .upload(generatedFileName, screenshotBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true // Use upsert for faster uploads
      });

    if (saveError) {
      throw new Error(`Failed to save generated image: ${saveError.message}`);
    }

    const { data: { publicUrl: generatedImageUrl } } = this.supabase.storage
      .from('ad-images')
      .getPublicUrl(generatedFileName);

    return { generatedFileName, generatedImageUrl };
  }
  
  // Add a faster method for bulk uploads that doesn't wait for each upload to complete
  async uploadMultipleImages(images: { id: string, buffer: Uint8Array }[]) {
    const uploadPromises = images.map(async (image) => {
      const timestamp = Date.now();
      const fileName = `full-ads/bulk/${image.id}_${timestamp}.jpg`;
      
      try {
        await this.supabase.storage
          .from('ad-images')
          .upload(fileName, image.buffer, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: true
          });
          
        const { data: { publicUrl } } = this.supabase.storage
          .from('ad-images')
          .getPublicUrl(fileName);
          
        return { id: image.id, url: publicUrl, success: true };
      } catch (error) {
        console.error(`Error uploading image ${image.id}:`, error);
        return { id: image.id, success: false, error };
      }
    });
    
    // Process uploads in parallel but limit concurrency
    const results = [];
    const batchSize = 3; // Process 3 uploads at a time
    
    for (let i = 0; i < uploadPromises.length; i += batchSize) {
      const batch = uploadPromises.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
    }
    
    return results;
  }
}
