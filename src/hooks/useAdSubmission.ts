
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Logger } from '@/utils/logger';

export const useAdSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // בדיקה האם הבקט קיים או יצירה אם צריך
  const ensureStorageBucket = async () => {
    try {
      // קריאה ל-Edge Function כדי לוודא שהבקט והפוליסות קיימים
      Logger.info('Calling create_storage_policy Edge Function...');
      try {
        const { error } = await supabase.functions.invoke('create_storage_policy');
        if (error) {
          Logger.error(`Error from Edge Function: ${error.message}`);
          // נמשיך בכל זאת, ננסה להשתמש באחסון ישירות
        } else {
          Logger.info('Storage policy setup successful');
          return true;
        }
      } catch (funcError) {
        Logger.error(`Failed to call Edge Function: ${funcError instanceof Error ? funcError.message : String(funcError)}`);
        // נמשיך בכל זאת, ננסה להשתמש באחסון ישירות
      }

      // בדיקה ישירה אם הבקט קיים
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        Logger.error(`Failed to list buckets: ${bucketsError.message}`);
        
        // ניסיון לגשת ישירות לתיקיית ad-images אף שאולי לא נוכל לראות אותה ברשימה
        try {
          const { data: files } = await supabase.storage.from('ad-images').list();
          if (files) {
            Logger.info('Successfully accessed ad-images bucket, it exists');
            return true;
          }
        } catch (accessError) {
          Logger.error(`Cannot access bucket: ${accessError instanceof Error ? accessError.message : String(accessError)}`);
        }
        
        return false;
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'ad-images');
      
      if (!bucketExists) {
        Logger.info('Creating storage bucket "ad-images"');
        
        // יצירת הבקט אם הוא לא קיים
        const { error: createError } = await supabase.storage
          .createBucket('ad-images', {
            public: true,
            fileSizeLimit: 10485760 // 10MB limit
          });
        
        if (createError) {
          Logger.error(`Failed to create bucket: ${createError.message}`);
          return false;
        }
        
        Logger.info('Storage bucket created successfully');
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
        // גם אם הבקט לא מוכן, ננסה בכל זאת להעלות את הקובץ
        Logger.warn('Storage bucket status uncertain, attempting upload anyway');
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
          contentType: file.type || 'image/jpeg'
        });

      if (uploadError) {
        Logger.error(`Upload error: ${uploadError.message}`);
        
        // בדיקה אם השגיאה קשורה להרשאות ואז ניסיון להמשיך בכל זאת
        if (uploadError.message.includes('permission') || uploadError.message.includes('not authorized')) {
          Logger.warn('Permission issues detected, attempting to create public URL anyway');
          
          // ניסיון ליצור URL גם אם העלאה נכשלה - הקובץ עשוי להיות כבר קיים
          const { data: { publicUrl } } = supabase.storage
            .from('ad-images')
            .getPublicUrl(filePath);
            
          if (publicUrl) {
            Logger.info(`Generated public URL, attempting to verify it: ${publicUrl}`);
            
            // בדיקה אם ה-URL תקף
            try {
              const response = await fetch(publicUrl, { method: 'HEAD' });
              if (response.ok) {
                Logger.info(`URL is valid: ${publicUrl}`);
                return publicUrl;
              }
            } catch (fetchError) {
              Logger.error(`URL validation failed: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
            }
          }
        }
        
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
