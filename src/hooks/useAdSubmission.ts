
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Logger } from '@/utils/logger';

export const useAdSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createBucketIfNotExists = async () => {
    try {
      // בדיקה קודם אם ה-bucket 'ad-images' קיים
      const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets();
      
      if (bucketListError) {
        Logger.error(`Error listing buckets: ${bucketListError.message}`);
        throw new Error(`Cannot list buckets: ${bucketListError.message}`);
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'ad-images');
      
      if (!bucketExists) {
        Logger.info('Bucket "ad-images" does not exist, attempting to create it');
        
        const { error: createBucketError } = await supabase.storage.createBucket('ad-images', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
        
        if (createBucketError) {
          Logger.error(`Error creating bucket: ${createBucketError.message}`);
          throw new Error(`Cannot create bucket: ${createBucketError.message}`);
        }
        
        // יצירת מדיניות גישה ציבורית לבאקט
        const { error: policyError } = await supabase.rpc('create_public_bucket_policy', {
          bucket_name: 'ad-images'
        });
        
        if (policyError) {
          Logger.warn(`Note: Could not set public policy automatically: ${policyError.message}`);
          // נמשיך בכל זאת - ייתכן שהמדיניות כבר הוגדרה או שאין לנו הרשאות לכך
        }
        
        Logger.info('Bucket "ad-images" created successfully');
      }
      
      return true;
    } catch (error) {
      Logger.error(`Error in createBucketIfNotExists: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

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

      // וידוא שהקובץ הוא מסוג תמונה
      if (!file.type.startsWith('image/')) {
        Logger.error(`Invalid file type: ${file.type} - only images are supported`);
        toast.error('Invalid file type: Only images are supported');
        return URL.createObjectURL(new Blob(['Invalid image type'], { type: 'text/plain' }));
      }

      // בדיקת גודל הקובץ - מקסימום 5MB
      if (file.size > 5 * 1024 * 1024) {
        Logger.error(`File too large: ${file.size} bytes - maximum is 5MB`);
        toast.error('File too large: Maximum file size is 5MB');
        return URL.createObjectURL(new Blob(['File too large'], { type: 'text/plain' }));
      }

      // יצירת הבאקט אם לא קיים
      const bucketReady = await createBucketIfNotExists();
      if (!bucketReady) {
        Logger.error('Failed to create or verify storage bucket');
        toast.error('Storage initialization failed');
        return URL.createObjectURL(file);
      }

      // יצירת שם קובץ ייחודי עם סיומת מקורית
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = fileName;

      Logger.info(`Attempting upload with path: ${filePath}`);

      // הכנת הקובץ לפורמט מתאים (קובץ גדול מידי עלול לגרום לשגיאת 422)
      let fileToUpload = file;
      if (file.size > 2 * 1024 * 1024) { // אם הקובץ גדול מ-2MB
        try {
          // נקטין את הקובץ על ידי שמירתו כ-Blob מחדש עם איכות מופחתת
          const canvas = document.createElement('canvas');
          const img = document.createElement('img');
          const ctx = canvas.getContext('2d');
          
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              // שומרים על היחס המקורי אבל מגבילים לרוחב מקסימלי
              const maxWidth = 1200;
              let width = img.width;
              let height = img.height;
              
              if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
              }
              
              canvas.width = width;
              canvas.height = height;
              
              ctx?.drawImage(img, 0, 0, width, height);
              
              // המרת הקנבס לבלוב בפורמט JPEG עם איכות מופחתת
              canvas.toBlob(blob => {
                if (blob) {
                  fileToUpload = new File([blob], file.name, { type: 'image/jpeg' });
                  resolve();
                } else {
                  reject(new Error('Failed to resize image'));
                }
              }, 'image/jpeg', 0.7); // 70% מהאיכות המקורית
            };
            
            img.onerror = () => {
              reject(new Error('Failed to load image for resizing'));
            };
            
            img.src = URL.createObjectURL(file);
          });
          
          Logger.info(`Image resized: original size=${file.size}, new size=${fileToUpload.size}`);
        } catch (resizeError) {
          Logger.warn(`Failed to resize image: ${resizeError instanceof Error ? resizeError.message : String(resizeError)}`);
          // נמשיך עם הקובץ המקורי אם הקטנה נכשלה
        }
      }

      // ניסיון להעלאת קובץ ל-supabase
      const { error: uploadError, data } = await supabase.storage
        .from('ad-images')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        Logger.error(`Upload error: ${uploadError.message}`);
        if (uploadError.message.includes('422')) {
          Logger.error('Server validation error (422): The file may not meet server requirements');
          toast.error('File upload failed: The file does not meet server requirements');
        } else {
          toast.error(`Upload failed: ${uploadError.message}`);
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
      
      // בדיקה שה-URL אכן קיים ונגיש
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' });
        if (!response.ok) {
          Logger.warn(`Public URL check failed: ${response.status} ${response.statusText}`);
        }
      } catch (urlCheckError) {
        Logger.warn(`Failed to verify public URL: ${urlCheckError instanceof Error ? urlCheckError.message : String(urlCheckError)}`);
      }
      
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
