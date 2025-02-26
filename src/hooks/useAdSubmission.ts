
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

      // Check if the 'ad-images' bucket exists, if not - try to create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'ad-images');
      
      if (!bucketExists) {
        Logger.info('Bucket "ad-images" does not exist, attempting to create it');
        try {
          const { error: createBucketError } = await supabase.storage.createBucket('ad-images', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          });
          
          if (createBucketError) {
            Logger.error(`Error creating bucket: ${createBucketError.message}`);
            // If the bucket cannot be created, return a URL to the image uploaded by the user via blob
            const objectURL = URL.createObjectURL(file);
            return objectURL;
          }
          
          Logger.info('Bucket "ad-images" created successfully');
        } catch (bucketError) {
          Logger.error(`Error creating bucket: ${bucketError instanceof Error ? bucketError.message : String(bucketError)}`);
          // If there is an error creating the bucket, return a URL to the image uploaded by the user via blob
          const objectURL = URL.createObjectURL(file);
          return objectURL;
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      Logger.info(`Attempting upload with path: ${filePath}`);

      // Attempt to upload file to supabase
      const { error: uploadError, data } = await supabase.storage
        .from('ad-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        Logger.error(`Upload error: ${uploadError.message}`);
        // In case of upload error, return a local URL for the image
        const objectURL = URL.createObjectURL(file);
        return objectURL;
      }

      Logger.info('Upload successful');

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(filePath);

      Logger.info(`Generated public URL: ${publicUrl}`);
      return publicUrl;
      
    } catch (error) {
      Logger.error(`Error in handleSubmission: ${error instanceof Error ? error.message : String(error)}`);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // In case of error, return a local URL for the image
      const objectURL = URL.createObjectURL(file);
      return objectURL;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmission,
    isSubmitting
  };
};
