
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Logger } from '@/utils/logger';

export const useAdSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [bucketStatus, setBucketStatus] = useState<'unknown' | 'exists' | 'not_exists' | 'error'>('unknown');

  // Check if the bucket exists with multiple fallbacks
  const checkBucketStatus = async (): Promise<boolean> => {
    try {
      Logger.info('Checking bucket status...');
      
      // First approach: Try to access bucket directly by listing files
      try {
        const { data: files, error: listError } = await supabase.storage
          .from('ad-images')
          .list('full-ads', { limit: 1 });
          
        if (!listError && files !== null) {
          Logger.info('Successfully accessed ad-images bucket by listing files');
          setBucketStatus('exists');
          return true;
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
            setBucketStatus('exists');
            return true;
          } else {
            Logger.warn('ad-images bucket NOT found in bucket list');
            setBucketStatus('not_exists');
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
          setBucketStatus('exists');
          return true;
        }
      } catch (e) {
        Logger.error(`Error checking public URL: ${e instanceof Error ? e.message : String(e)}`);
      }
      
      // All approaches failed, assume bucket doesn't exist
      setBucketStatus('not_exists');
      return false;
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
  const uploadFile = async (file: File, path: string, adName?: string): Promise<string | null> => {
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
        setLastError(`Upload error: ${uploadError.message}`);
        return null;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(fullPath);
      
      Logger.info(`File uploaded successfully: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Logger.error(`Exception during upload: ${errorMsg}`);
      setLastError(`Upload exception: ${errorMsg}`);
      return null;
    }
  };

  // Convert a data URL to a Blob/File
  const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File | null> => {
    try {
      // Extract the base64 part of the data URL
      const arr = dataUrl.split(',');
      if (arr.length < 2) {
        throw new Error('Invalid data URL format');
      }
      
      // Determine mime type from the data URL
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/png';
      
      // Convert base64 to binary
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      return new File([u8arr], filename, { type: mime });
    } catch (error) {
      Logger.error(`Error converting data URL to file: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  };

  // Main function to handle the entire upload process
  const handleSubmission = async (file: File, renderedPreviewUrl?: string, adName?: string): Promise<string | null> => {
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
      
      // 3. Generate unique identifiers for this upload
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const uploadId = `${timestamp}-${randomId}`;
      
      // 4. Handle rendered preview if available
      if (renderedPreviewUrl) {
        Logger.info('Using edge function with rendered preview to generate the ad');
        
        try {
          const formData = new FormData();
          formData.append('image', file);
          formData.append('renderedPreview', renderedPreviewUrl);
          formData.append('data', JSON.stringify({
            width: 1200,
            height: 628,
            fastMode: true,
            headline: adName // Pass the ad name for file naming
          }));
          
          const { data, error } = await supabase.functions.invoke('generate-ad', {
            body: formData
          });
          
          if (error) {
            Logger.error(`Edge function error: ${error.message}`);
            throw new Error(`Edge function failed: ${error.message}`);
          }
          
          if (data?.imageUrl) {
            Logger.info(`Successfully generated ad via edge function: ${data.imageUrl}`);
            return data.imageUrl;
          } else {
            throw new Error('No image URL returned from edge function');
          }
        } catch (edgeError) {
          Logger.error(`Edge function processing failed: ${edgeError instanceof Error ? edgeError.message : String(edgeError)}`);
          
          // Fall back to direct upload if edge function fails
          Logger.info('Falling back to direct upload after edge function failure');
          
          // Try to upload the rendered preview directly if available
          if (renderedPreviewUrl) {
            try {
              const previewFile = await dataUrlToFile(renderedPreviewUrl, `preview-${uploadId}.png`);
              if (previewFile) {
                const previewPath = `${timestamp}-preview-${randomId}.png`;
                const previewUrl = await uploadFile(previewFile, previewPath, adName);
                
                if (previewUrl) {
                  Logger.info(`Successfully uploaded rendered preview directly: ${previewUrl}`);
                  return previewUrl;
                }
              }
            } catch (previewError) {
              Logger.error(`Failed to upload preview directly: ${previewError instanceof Error ? previewError.message : String(previewError)}`);
              // Continue with original file upload
            }
          }
        }
      } else {
        // No rendered preview, try using the edge function in fast mode
        try {
          Logger.info('Using edge function in fast mode');
          
          const formData = new FormData();
          formData.append('image', file);
          formData.append('data', JSON.stringify({
            width: 1200,
            height: 628,
            fastMode: true,
            headline: adName // Pass the ad name for file naming
          }));
          
          const { data, error } = await supabase.functions.invoke('generate-ad', {
            body: formData
          });
          
          if (error) {
            Logger.error(`Edge function fast mode error: ${error.message}`);
            // Fall through to direct upload
          } else if (data?.imageUrl) {
            Logger.info(`Successfully generated ad via edge function fast mode: ${data.imageUrl}`);
            return data.imageUrl;
          }
        } catch (fastModeError) {
          Logger.error(`Fast mode error: ${fastModeError instanceof Error ? fastModeError.message : String(fastModeError)}`);
          // Fall through to direct upload
        }
      }
      
      // 5. If all else fails, try direct upload
      const filePath = `${timestamp}-direct-${randomId}.${file.name.split('.').pop() || 'jpg'}`;
      const uploadedUrl = await uploadFile(file, filePath, adName);
      
      if (uploadedUrl) {
        Logger.info(`Successfully uploaded file directly: ${uploadedUrl}`);
        return uploadedUrl;
      }
      
      throw new Error(`Could not upload image after multiple attempts. Last error: ${lastError || 'Unknown error'}`);
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
