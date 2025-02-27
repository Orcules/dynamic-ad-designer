
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Logger } from '@/utils/logger';

export const useAdSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // בדיקה האם הבקט קיים או יצירה אם צריך
  const ensureStorageBucket = async () => {
    try {
      // בדיקה אם הבקט קיים
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        Logger.error(`Failed to list buckets: ${bucketsError.message}`);
        return false;
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'ad-images');
      
      if (!bucketExists) {
        Logger.info('Creating storage bucket "ad-images"');
        
        // יצירת הבקט אם הוא לא קיים
        const { error: createError } = await supabase.storage.createBucket('ad-images', {
          public: true,
          fileSizeLimit: 10485760 // 10MB limit
        });
        
        if (createError) {
          Logger.error(`Failed to create bucket: ${createError.message}`);
          return false;
        }
        
        Logger.info('Storage bucket created successfully');
        
        // הפולסיות מוגדרות במהלך היצירה (public: true)
        // אין צורך בהגדרות נוספות כי הבקט נוצר כפומבי (public)
        return true;
      }
      
      return true; // הבקט קיים
    } catch (error) {
      Logger.error(`Error checking/creating bucket: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

  // טיפול בהעלאת קובץ והחזרת URL
  const handleSubmission = async (file: File) => {
    setIsSubmitting(true);
    
    try {
      Logger.info(`Starting file upload: ${file.name}, size: ${file.size}, type: ${file.type}`);
      
      // ניסיון לוודא שבקט האחסון קיים
      const bucketReady = await ensureStorageBucket();
      
      if (!bucketReady) {
        throw new Error('Storage bucket is not available');
      }
      
      // יצירת שם קובץ ייחודי
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `${timestamp}-${randomId}.${fileExt}`;
      
      Logger.info(`Uploading file to path: ${filePath}`);

      // העלאת הקובץ לsupabase
      const { data, error: uploadError } = await supabase.storage
        .from('ad-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        Logger.error(`Upload error: ${uploadError.message}`);
        throw new Error(`Could not upload image: ${uploadError.message}`);
      }

      // אחזור ה-URL הציבורי של הקובץ שהועלה
      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(filePath);

      Logger.info(`File uploaded successfully: ${publicUrl}`);
      
      return publicUrl;
    } catch (error) {
      Logger.error(`Error in handleSubmission: ${error instanceof Error ? error.message : String(error)}`);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmission,
    isSubmitting
  };
};
