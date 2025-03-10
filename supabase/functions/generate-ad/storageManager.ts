
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export class StorageManager {
  private supabase;
  private uploadCache = new Map<string, string>();
  
  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  async uploadOriginalImage(uploadId: string, image: any) {
    // Check if we've already uploaded this image (based on content hash)
    const contentHash = await this.calculateContentHash(image);
    if (this.uploadCache.has(contentHash)) {
      return { originalFileName: '', originalImageUrl: this.uploadCache.get(contentHash)! };
    }
    
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
    
    // Cache this upload for future reference
    this.uploadCache.set(contentHash, originalImageUrl);

    return { originalFileName, originalImageUrl };
  }

  async uploadGeneratedImage(uploadId: string, screenshotBuffer: Uint8Array) {
    // We don't cache generated images as they should be unique
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
    
    // Process uploads in parallel with increased batch size for faster processing
    const results = [];
    const batchSize = 5; // Process 5 uploads at a time (increased from 3)
    
    for (let i = 0; i < uploadPromises.length; i += batchSize) {
      const batch = uploadPromises.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
    }
    
    return results;
  }
  
  // Helper method to calculate a simple content hash for caching
  private async calculateContentHash(buffer: ArrayBuffer): Promise<string> {
    try {
      // Create a simple hash based on the first 100 bytes and the total size
      const array = new Uint8Array(buffer);
      const subset = array.slice(0, Math.min(100, array.length));
      let hash = 0;
      
      for (let i = 0; i < subset.length; i++) {
        hash = ((hash << 5) - hash) + subset[i];
        hash |= 0; // Convert to 32bit integer
      }
      
      return `${hash}_${buffer.byteLength}`;
    } catch (e) {
      return `default_${Date.now()}`;
    }
  }
}
