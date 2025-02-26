
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

      // בדיקה אם הקובץ קיים והוא תקין
      if (!file || file.size === 0) {
        Logger.error('Invalid file: file is empty or undefined');
        toast.error('Invalid file: Please select a valid image');
        return URL.createObjectURL(new Blob(['Invalid image'], { type: 'text/plain' }));
      }

      // בדיקה קודם אם ה-bucket 'ad-images' קיים, אם לא - ננסה ליצור אותו
      const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets();
      
      if (bucketListError) {
        Logger.error(`Error listing buckets: ${bucketListError.message}`);
        const objectURL = URL.createObjectURL(file);
        return objectURL;
      }
      
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
            // במידה ולא ניתן ליצור את ה-bucket, נחזיר URL לתמונה שהמשתמש העלה באמצעות ה-blob
            const objectURL = URL.createObjectURL(file);
            return objectURL;
          }
          
          Logger.info('Bucket "ad-images" created successfully');
        } catch (bucketError) {
          Logger.error(`Error creating bucket: ${bucketError instanceof Error ? bucketError.message : String(bucketError)}`);
          // במידה ויש שגיאה ביצירת ה-bucket, נחזיר URL לתמונה שהמשתמש העלה באמצעות ה-blob
          const objectURL = URL.createObjectURL(file);
          return objectURL;
        }
      }

      // יצירת שם קובץ ייחודי עם סיומת מקורית
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      Logger.info(`Attempting upload with path: ${filePath}`);

      // ניסיון להעלאת קובץ ל-supabase
      const { error: uploadError, data } = await supabase.storage
        .from('ad-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        Logger.error(`Upload error: ${uploadError.message}`);
        if (uploadError.message.includes('422')) {
          Logger.error('Server validation error (422): The file may not meet server requirements');
          toast.error('File upload failed: The file does not meet server requirements');
        }
        // במקרה של שגיאה בהעלאה, נחזיר URL מקומי לתמונה
        const objectURL = URL.createObjectURL(file);
        return objectURL;
      }

      Logger.info('Upload successful');

      // קבלת ה-URL הציבורי
      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(filePath);

      Logger.info(`Generated public URL: ${publicUrl}`);
      return publicUrl;
      
    } catch (error) {
      Logger.error(`Error in handleSubmission: ${error instanceof Error ? error.message : String(error)}`);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // במקרה של שגיאה, נחזיר URL מקומי לתמונה
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
