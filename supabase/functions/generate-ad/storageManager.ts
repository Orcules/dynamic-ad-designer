
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export class StorageManager {
  private supabase;
  private imageCache: Map<string, string>;
  
  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    this.imageCache = new Map();
  }

  async uploadOriginalImage(uploadId: string, image: any) {
    const timestamp = Date.now();
    const originalFileName = `full-ads/${uploadId}_${timestamp}.jpg`;
    
    // Check cache first
    if (this.imageCache.has(originalFileName)) {
      return { 
        originalFileName, 
        originalImageUrl: this.imageCache.get(originalFileName) 
      };
    }
    
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
    
    // Cache the URL
    this.imageCache.set(originalFileName, originalImageUrl);

    return { originalFileName, originalImageUrl };
  }

  async uploadGeneratedImage(uploadId: string, screenshotBuffer: Uint8Array) {
    const timestamp = Date.now();
    const generatedFileName = `full-ads/${uploadId}_${timestamp}.png`;
    
    // Check cache first
    if (this.imageCache.has(generatedFileName)) {
      return { 
        generatedFileName, 
        generatedImageUrl: this.imageCache.get(generatedFileName) 
      };
    }
    
    // Use optimized upload settings with higher quality preservation
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
    
    // Cache the URL
    this.imageCache.set(generatedFileName, generatedImageUrl);

    return { generatedFileName, generatedImageUrl };
  }
  
  // Add a faster method for bulk uploads that doesn't wait for each upload to complete
  async uploadMultipleImages(images: { id: string, buffer: Uint8Array }[]) {
    const uploadPromises = images.map(async (image) => {
      const timestamp = Date.now();
      const fileName = `full-ads/${image.id}_${timestamp}.jpg`;
      
      // Check cache first
      if (this.imageCache.has(fileName)) {
        return { 
          id: image.id, 
          url: this.imageCache.get(fileName), 
          success: true 
        };
      }
      
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
        
        // Cache the URL
        this.imageCache.set(fileName, publicUrl);
          
        return { id: image.id, url: publicUrl, success: true };
      } catch (error) {
        console.error(`Error uploading image ${image.id}:`, error);
        return { id: image.id, success: false, error };
      }
    });
    
    // Process uploads in parallel with increased batch size for better performance
    const results = [];
    const batchSize = 8; // Increased batch size for better performance
    
    for (let i = 0; i < uploadPromises.length; i += batchSize) {
      const batch = uploadPromises.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
    }
    
    return results;
  }
}
