
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Logger } from '@/utils/logger';

export const useAdSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [bucketStatus, setBucketStatus] = useState<'unknown' | 'exists' | 'not_exists' | 'error'>('unknown');

  // Check if the bucket exists
  const checkBucketStatus = async (): Promise<boolean> => {
    try {
      Logger.info('Checking bucket status...');
      
      // Direct method: list all buckets and check if ad-images exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        Logger.error(`Error listing buckets: ${bucketsError.message}`);
        setBucketStatus('error');
        setLastError(`Bucket listing error: ${bucketsError.message}`);
        
        // Try to access the bucket directly despite the error
        try {
          const { data: files } = await supabase.storage.from('ad-images').list();
          if (files) {
            Logger.info('Successfully accessed ad-images bucket despite list error');
            setBucketStatus('exists');
            return true;
          }
        } catch (e) {
          // Access error - bucket probably doesn't exist or no permissions
        }
        
        return false;
      }
      
      // Check if bucket exists in the list
      const bucketExists = buckets?.some(bucket => bucket.name === 'ad-images');
      
      if (bucketExists) {
        Logger.info('ad-images bucket found in bucket list');
        setBucketStatus('exists');
        return true;
      } else {
        Logger.warn('ad-images bucket NOT found in bucket list');
        setBucketStatus('not_exists');
        return false;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.error(`Error checking bucket status: ${errorMsg}`);
      setBucketStatus('error');
      setLastError(`Bucket check error: ${errorMsg}`);
      return false;
    }
  };

  // Create the bucket if it doesn't exist
  const createBucket = async (): Promise<boolean> => {
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
        setLastError(`Bucket creation error: ${errorMsg}`);
        
        // Check if the error indicates the bucket already exists
        if (errorMsg.includes('already exists')) {
          Logger.info('Bucket already exists based on error message');
          setBucketStatus('exists');
          return true;
        }
        
        return false;
      }
      
      Logger.info('Bucket created successfully');
      setBucketStatus('exists');
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.error(`Error creating bucket: ${errorMsg}`);
      setLastError(`Bucket creation exception: ${errorMsg}`);
      return false;
    }
  };

  // Upload a file when we know the bucket exists
  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    try {
      Logger.info(`Uploading file ${file.name} (${file.size} bytes) to ${path}`);
      
      const { data, error: uploadError } = await supabase.storage
        .from('ad-images')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg'
        });
        
      if (uploadError) {
        Logger.error(`Upload error: ${uploadError.message}`);
        setLastError(`Upload error: ${uploadError.message}`);
        return null;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(path);
        
      Logger.info(`File uploaded successfully: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.error(`Exception during upload: ${errorMsg}`);
      setLastError(`Upload exception: ${errorMsg}`);
      return null;
    }
  };

  // Main function to handle the entire upload process
  const handleSubmission = async (file: File): Promise<string> => {
    setIsSubmitting(true);
    setLastError(null);
    
    try {
      Logger.info(`Starting file upload process for: ${file.name}, size: ${file.size}, type: ${file.type}`);
      
      // 1. Check if bucket exists
      let bucketReady = await checkBucketStatus();
      
      // 2. Try to create the bucket if it doesn't exist
      if (!bucketReady) {
        Logger.info('Bucket not ready, attempting to create it');
        bucketReady = await createBucket();
      }
      
      // 3. If still no bucket, try to call Edge Function
      if (!bucketReady) {
        Logger.info('Still no bucket, calling Edge Function as last resort');
        
        try {
          const { error } = await supabase.functions.invoke('create_storage_policy', {
            body: { bucket_name: 'ad-images' }
          });
          
          if (error) {
            Logger.error(`Edge Function error: ${error.message}`);
            // Continue anyway, maybe the bucket exists despite the error
          } else {
            Logger.info('Edge Function executed successfully');
            // Check again if the bucket exists after the function call
            bucketReady = await checkBucketStatus();
          }
        } catch (funcError) {
          Logger.error(`Failed to call Edge Function: ${funcError instanceof Error ? funcError.message : String(funcError)}`);
          // Continue anyway, maybe the bucket exists
        }
      }
      
      // 4. Prepare unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `${timestamp}-${randomId}.${fileExt}`;
      
      // 5. Try upload even if bucket not ready (maybe permissions exist anyway)
      Logger.info(`Attempting to upload file to path: ${filePath}`);
      const uploadedUrl = await uploadFile(file, filePath);
      
      if (uploadedUrl) {
        // Upload successful
        return uploadedUrl;
      }
      
      // 6. Upload failed, try to generate URL manually (if file maybe uploaded)
      Logger.warn('Upload returned null, attempting to generate URL anyway');
      
      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(filePath);
      
      // 7. Validate if the URL is valid (try to access it)
      try {
        Logger.info(`Testing generated URL: ${publicUrl}`);
        const response = await fetch(publicUrl, { method: 'HEAD' });
        
        if (response.ok) {
          Logger.info('URL validation succeeded');
          return publicUrl;
        }
        
        Logger.error(`URL validation failed with status: ${response.status}`);
      } catch (fetchError) {
        Logger.error(`URL fetch test failed: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
      }
      
      // All attempts failed
      throw new Error(`Could not upload image. Last error: ${lastError || 'Unknown error'}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Fatal error in handleSubmission: ${errorMessage}`);
      toast.error(`Upload failed: ${errorMessage}`);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Return functions and status
  return {
    handleSubmission,
    isSubmitting,
    lastError,
    bucketStatus,
    checkBucketStatus,
    createBucket
  };
};
