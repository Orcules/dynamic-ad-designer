
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Logger } from '@/utils/logger';

export const useAdSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // יצירת בקט אחסון אם אינו קיים
  const createStorageBucketIfNotExists = async () => {
    try {
      // בדיקה אם הבקט כבר קיים
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        Logger.error(`Failed to list buckets: ${bucketsError.message}`);
        return false;
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'ad-images');
      
      if (!bucketExists) {
        Logger.info('Creating storage bucket "ad-images"');
        // ניסיון ליצור את הבקט
        const { data, error } = await supabase.storage.createBucket('ad-images', {
          public: true,
          fileSizeLimit: 10485760 // 10MB limit
        });
        
        if (error) {
          Logger.error(`Failed to create bucket: ${error.message}`);
          toast.error(`Could not create storage bucket: ${error.message}`);
          return false;
        }
        
        Logger.info('Storage bucket created successfully');
        
        // מגדיר את הבקט כציבורי (אם לא הוגדר כך)
        const { error: policyError } = await supabase.rpc('create_storage_policy', {
          bucket_name: 'ad-images'
        });
        
        if (policyError) {
          Logger.warn(`Failed to set bucket policy: ${policyError.message}`);
        }
        
        return true;
      }
      
      return bucketExists;
    } catch (error) {
      Logger.error(`Error checking/creating bucket: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

  const handleSubmission = async (file: File) => {
    try {
      setIsSubmitting(true);
      
      // Log file details for debugging
      Logger.info(`Starting file upload: ${file.name}, size: ${file.size}, type: ${file.type}`);

      // First, create a blob URL as fallback in case of storage API issues
      const blobUrl = URL.createObjectURL(file);

      // Make sure the storage bucket exists
      const bucketExists = await createStorageBucketIfNotExists();
      
      if (bucketExists) {
        // If the bucket exists, try to upload the file
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = fileName;

        Logger.info(`Attempting upload with path: ${filePath}`);

        // Try to upload file to Supabase
        const { error: uploadError, data } = await supabase.storage
          .from('ad-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true // Changed to true to overwrite if exists
          });

        if (uploadError) {
          Logger.error(`Upload error: ${uploadError.message}`);
          toast.error(`Could not upload image: ${uploadError.message}`);
          // In case of upload error, return the blob URL
          return blobUrl;
        }

        Logger.info('Upload successful');

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('ad-images')
          .getPublicUrl(filePath);

        Logger.info(`Generated public URL: ${publicUrl}`);
        return publicUrl;
      } else {
        Logger.info('Bucket "ad-images" does not exist or could not be created, using blob URL');
        return blobUrl;
      }
    } catch (error) {
      Logger.error(`Error in handleSubmission: ${error instanceof Error ? error.message : String(error)}`);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // In case of error, try to create a blob URL
      try {
        const objectURL = URL.createObjectURL(file);
        return objectURL;
      } catch (blobError) {
        Logger.error(`Failed to create blob URL: ${blobError instanceof Error ? blobError.message : String(blobError)}`);
        return null;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmission,
    isSubmitting
  };
};
