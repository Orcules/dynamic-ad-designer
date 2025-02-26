
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Logger } from '@/utils/logger';

export const useAdSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmission = async (file: File) => {
    try {
      setIsSubmitting(true);
      
      // Log file details for debugging
      Logger.info(`Starting file upload: ${file.name}, size: ${file.size}, type: ${file.type}`);

      // First, create a blob URL as fallback in case of storage API issues
      const blobUrl = URL.createObjectURL(file);

      try {
        // Check if the 'ad-images' bucket exists
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === 'ad-images');
        
        if (bucketExists) {
          // If the bucket exists, try to upload the file
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          Logger.info(`Attempting upload with path: ${filePath}`);

          // Try to upload file to Supabase
          const { error: uploadError, data } = await supabase.storage
            .from('ad-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            Logger.error(`Upload error: ${uploadError.message}`);
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
          Logger.info('Bucket "ad-images" does not exist, using blob URL');
          return blobUrl;
        }
      } catch (storageError) {
        Logger.error(`Storage API error: ${storageError instanceof Error ? storageError.message : String(storageError)}`);
        // Return the blob URL if there's any error with storage
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
