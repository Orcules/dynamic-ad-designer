
import { supabase } from '@/integrations/supabase/client';
import { Logger } from '@/utils/logger';

export class BucketService {
  /**
   * Check if the ad-images bucket exists with multiple fallbacks
   */
  static async checkBucketStatus(): Promise<{ exists: boolean; error?: string }> {
    try {
      Logger.info('Checking bucket status...');
      
      // First approach: Try to access bucket directly by listing files
      try {
        const { data: files, error: listError } = await supabase.storage
          .from('ad-images')
          .list('full-ads', { limit: 1 });
          
        if (!listError && files !== null) {
          Logger.info('Successfully accessed ad-images bucket by listing files');
          return { exists: true };
        }
      } catch (accessError) {
        Logger.warn(`Could not list files: ${accessError instanceof Error ? accessError.message : String(accessError)}`);
      }
      
      // Second approach: List all buckets and check
      try {
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          Logger.error(`Error listing buckets: ${bucketsError.message}`);
        } else {
          const bucketExists = buckets?.some(bucket => bucket.name === 'ad-images');
          
          if (bucketExists) {
            Logger.info('ad-images bucket found in bucket list');
            return { exists: true };
          } else {
            Logger.warn('ad-images bucket NOT found in bucket list');
          }
        }
      } catch (bucketsError) {
        Logger.error(`Error getting bucket list: ${bucketsError instanceof Error ? bucketsError.message : String(bucketsError)}`);
      }
      
      // Final approach: Just try to get info about the bucket to check if it exists
      try {
        // Make a minimal request to check if we can access the bucket
        const { data: { publicUrl } } = supabase.storage.from('ad-images').getPublicUrl('test.txt');
        if (publicUrl) {
          Logger.info('Successfully generated public URL for ad-images bucket');
          return { exists: true };
        }
      } catch (e) {
        Logger.error(`Error checking public URL: ${e instanceof Error ? e.message : String(e)}`);
      }
      
      // All approaches failed, assume bucket doesn't exist
      return { exists: false };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.error(`Error checking bucket status: ${errorMsg}`);
      return { exists: false, error: errorMsg };
    }
  }

  /**
   * Create the bucket if it doesn't exist
   */
  static async createBucket(): Promise<{ success: boolean; error?: string }> {
    try {
      Logger.info('Creating ad-images bucket...');
      
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase.storage
        .createBucket('ad-images', {
          public: true,
          fileSizeLimit: 10485760 // 10MB
        });
      
      if (createError) {
        const errorMsg = createError.message;
        Logger.error(`Failed to create bucket: ${errorMsg}`);
        
        // Check if the error indicates the bucket already exists
        if (errorMsg.includes('already exists')) {
          Logger.info('Bucket already exists based on error message');
          return { success: true };
        }
        
        return { success: false, error: errorMsg };
      }
      
      Logger.info('Bucket created successfully');
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.error(`Error creating bucket: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Upload a file to the bucket
   */
  static async uploadFile(file: File, path: string, adName?: string): Promise<{ url: string | null; error?: string }> {
    try {
      Logger.info(`Uploading file ${file.name} (${file.size} bytes) to ${path}`);
      
      // Use the ad name for the filename if provided
      const fileName = adName ? 
        `${adName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '')}_${Date.now()}.${file.name.split('.').pop() || 'jpg'}` :
        path;
        
      // Upload to the full-ads directory
      const fullPath = `full-ads/${fileName}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('ad-images')
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg'
        });
      
      if (uploadError) {
        Logger.error(`Upload error: ${uploadError.message}`);
        return { url: null, error: uploadError.message };
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(fullPath);
      
      Logger.info(`File uploaded successfully: ${publicUrl}`);
      return { url: publicUrl };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.error(`Exception during upload: ${errorMsg}`);
      return { url: null, error: errorMsg };
    }
  }
}
