
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

  async uploadOriginalImage(uploadId: string, image: any, adName?: string, language?: string, fontName?: string, aspectRatio?: string, templateStyle?: string, version: number = 1) {
    const timestamp = Date.now();
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Format the file name according to the required structure
    const sanitizedName = adName ? this.sanitizeFileName(adName) : `ad_${uploadId}`;
    const lang = language ? this.sanitizeFileName(language) : 'unknown';
    const font = fontName ? this.sanitizeFileName(fontName) : 'default';
    const ratio = aspectRatio ? this.sanitizeFileName(aspectRatio) : '1-1';
    const style = templateStyle ? this.sanitizeFileName(templateStyle) : 'standard';
    
    const originalFileName = `full-ads/${sanitizedName}-${dateStr}-${lang}-${font}-${ratio}-${style}-Ver${version}_original.jpg`;
    
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
    console.log(`Original image uploaded to: ${originalFileName}, URL: ${originalImageUrl}`);

    return { originalFileName, originalImageUrl };
  }

  async uploadGeneratedImage(uploadId: string, screenshotBuffer: Uint8Array, adName?: string, language?: string, fontName?: string, aspectRatio?: string, templateStyle?: string, version: number = 1) {
    const timestamp = Date.now();
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Format the file name according to the required structure
    const sanitizedName = adName ? this.sanitizeFileName(adName) : `ad_${uploadId}`;
    const lang = language ? this.sanitizeFileName(language) : 'unknown';
    const font = fontName ? this.sanitizeFileName(fontName) : 'default';
    const ratio = aspectRatio ? this.sanitizeFileName(aspectRatio) : '1-1';
    const style = templateStyle ? this.sanitizeFileName(templateStyle) : 'standard';
    
    const generatedFileName = `full-ads/${sanitizedName}-${dateStr}-${lang}-${font}-${ratio}-${style}-Ver${version}_generated.png`;
    
    // Check cache first
    if (this.imageCache.has(generatedFileName)) {
      return { 
        generatedFileName, 
        generatedImageUrl: this.imageCache.get(generatedFileName) 
      };
    }
    
    // Verify we have valid data
    if (!screenshotBuffer || screenshotBuffer.length === 0) {
      throw new Error('Empty screenshot buffer provided');
    }
    
    console.log(`Uploading generated image: ${generatedFileName}, buffer size: ${screenshotBuffer.length} bytes`);
    
    // Upload as PNG for better quality of generated ads with text
    const { error: saveError } = await this.supabase.storage
      .from('ad-images')
      .upload(generatedFileName, screenshotBuffer, {
        contentType: 'image/png',
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
    console.log(`Generated image uploaded to: ${generatedFileName}, URL: ${generatedImageUrl}`);

    return { generatedFileName, generatedImageUrl };
  }
  
  // Add a method specifically for uploading rendered previews
  async uploadRenderedPreview(uploadId: string, previewData: string, adName?: string, language?: string, fontName?: string, aspectRatio?: string, templateStyle?: string, version: number = 1) {
    try {
      console.log(`Processing rendered preview for ${uploadId}`);
      
      if (!previewData || !previewData.startsWith('data:')) {
        throw new Error('Invalid preview data format');
      }
      
      // Extract the base64 data
      const base64Data = previewData.split(',')[1];
      if (!base64Data) {
        throw new Error('No base64 data found in preview');
      }
      
      // Convert to binary
      const binaryData = atob(base64Data);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }
      
      // Determine proper content type from the data URL
      const contentTypeMatch = previewData.match(/data:(.*?);/);
      const contentType = contentTypeMatch ? contentTypeMatch[1] : 'image/png';
      
      // Create a unique filename with the new format
      const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Format the file name according to the required structure
      const sanitizedName = adName ? this.sanitizeFileName(adName) : `ad_${uploadId}`;
      const lang = language ? this.sanitizeFileName(language) : 'unknown';
      const font = fontName ? this.sanitizeFileName(fontName) : 'default';
      const ratio = aspectRatio ? this.sanitizeFileName(aspectRatio) : '1-1';
      const style = templateStyle ? this.sanitizeFileName(templateStyle) : 'standard';
      
      const renderedFileName = `full-ads/${sanitizedName}-${dateStr}-${lang}-${font}-${ratio}-${style}-Ver${version}_rendered.png`;
      
      console.log(`Uploading rendered preview: ${renderedFileName}, size: ${bytes.length} bytes, type: ${contentType}`);
      
      // Upload the rendered preview
      const { error: uploadError } = await this.supabase.storage
        .from('ad-images')
        .upload(renderedFileName, bytes, {
          contentType: contentType,
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        throw new Error(`Failed to upload rendered preview: ${uploadError.message}`);
      }
      
      const { data: { publicUrl: renderedUrl } } = this.supabase.storage
        .from('ad-images')
        .getPublicUrl(renderedFileName);
      
      console.log(`Rendered preview uploaded successfully: ${renderedUrl}`);
      
      // Cache the URL
      this.imageCache.set(renderedFileName, renderedUrl);
      
      return { 
        renderedFileName, 
        renderedUrl 
      };
    } catch (error) {
      console.error(`Error uploading rendered preview: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  // Helper method to sanitize file names
  private sanitizeFileName(name: string): string {
    // Replace spaces with hyphens and remove special characters
    return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '')
      // Ensure the name isn't too long for file systems
      .substring(0, 50);
  }
  
  // Add a faster method for bulk uploads that doesn't wait for each upload to complete
  async uploadMultipleImages(images: { id: string, buffer: Uint8Array, name?: string, language?: string, fontName?: string, aspectRatio?: string, templateStyle?: string, version?: number }[]) {
    const uploadPromises = images.map(async (image) => {
      const timestamp = Date.now();
      const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Format the file name according to the required structure
      const sanitizedName = image.name ? this.sanitizeFileName(image.name) : `ad_${image.id}`;
      const lang = image.language ? this.sanitizeFileName(image.language) : 'unknown';
      const font = image.fontName ? this.sanitizeFileName(image.fontName) : 'default';
      const ratio = image.aspectRatio ? this.sanitizeFileName(image.aspectRatio) : '1-1';
      const style = image.templateStyle ? this.sanitizeFileName(image.templateStyle) : 'standard';
      const version = image.version || 1;
      
      const fileName = `full-ads/${sanitizedName}-${dateStr}-${lang}-${font}-${ratio}-${style}-Ver${version}.jpg`;
      
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
        console.log(`Bulk image uploaded to: ${fileName}, URL: ${publicUrl}`);
          
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
