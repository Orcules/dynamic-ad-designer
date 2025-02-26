
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
        
        Logger.info('Bucket "ad-images" created successfully');
      }
      
      return true;
    } catch (error) {
      Logger.error(`Error in createBucketIfNotExists: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

  // פונקציה חדשה לדחיסת תמונה
  const compressImage = async (file: File, maxSizeKB: number = 1024): Promise<File> => {
    // בדיקה אם הקובץ כבר קטן מהגודל המקסימלי
    if (file.size <= maxSizeKB * 1024) {
      return file;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // חישוב יחס דחיסה התחלתי
          let quality = 0.9; // איכות התחלתית
          const compressionRatio = (maxSizeKB * 1024) / file.size;
          if (compressionRatio < 0.9) {
            quality = Math.max(0.1, compressionRatio);
          }
          
          // שמירת היחס המקורי
          let width = img.width;
          let height = img.height;
          
          // הגבלת גודל תמונה לפי צורך
          const MAX_DIMENSION = 1800;
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
              height = (height / width) * MAX_DIMENSION;
              width = MAX_DIMENSION;
            } else {
              width = (width / height) * MAX_DIMENSION;
              height = MAX_DIMENSION;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // אחרי שצמצמנו רזולוציה, נסיון דחיסה עם איכות מופחתת בלולאה עד שמגיעים לגודל מתאים
          const compressRecursively = (currentQuality: number) => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Canvas to Blob conversion failed'));
                  return;
                }
                
                // בדיקה אם הגענו לגודל היעד או שהאיכות נמוכה מאוד
                if (blob.size <= maxSizeKB * 1024 || currentQuality <= 0.2) {
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  
                  Logger.info(`Image compressed: ${file.size} -> ${compressedFile.size} bytes (${(compressedFile.size / file.size * 100).toFixed(2)}% of original), quality: ${currentQuality.toFixed(2)}`);
                  resolve(compressedFile);
                } else {
                  // דחיסה נוספת עם איכות מופחתת
                  const newQuality = Math.max(0.1, currentQuality - 0.1);
                  compressRecursively(newQuality);
                }
              },
              'image/jpeg',
              currentQuality
            );
          };
          
          compressRecursively(quality);
        };
        
        img.onerror = () => {
          reject(new Error('Error loading image'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
    });
  };

  const sanitizeFileName = (fileName: string): string => {
    // הסרת תווים בעייתיים מהשם
    const sanitized = fileName.replace(/[^\w\s.-]/g, '');
    // הגבלת אורך השם
    return sanitized.substring(0, 100);
  };

  const handleSubmission = async (file: File) => {
    try {
      setIsSubmitting(true);
      
      // בדיקות תקינות בסיסיות
      if (!file || file.size === 0) {
        Logger.error('Invalid file: file is empty or undefined');
        toast.error('Invalid file: Please select a valid image');
        return URL.createObjectURL(new Blob(['Invalid image'], { type: 'text/plain' }));
      }

      if (!file.type.startsWith('image/')) {
        Logger.error(`Invalid file type: ${file.type} - only images are supported`);
        toast.error('Invalid file type: Only images are supported');
        return URL.createObjectURL(new Blob(['Invalid image type'], { type: 'text/plain' }));
      }

      if (file.size > 5 * 1024 * 1024) {
        Logger.error(`File too large: ${file.size} bytes - maximum is 5MB`);
        toast.error('File too large, compressing...');
        // כאן נדחס את התמונה במקום לדחות אותה
      }

      // יצירת הבאקט אם לא קיים
      const bucketReady = await createBucketIfNotExists();
      if (!bucketReady) {
        Logger.error('Failed to create or verify storage bucket');
        toast.error('Storage initialization failed');
        return URL.createObjectURL(file);
      }

      // יצירת שם קובץ ייחודי וטוחן
      const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const sanitizedName = sanitizeFileName(file.name.split('.')[0] || 'image');
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 10);
      const fileName = `${sanitizedName}-${timestamp}-${randomStr}.${fileExt}`;
      
      // התאמת גודל התמונה לדרישות השרת (במיוחד עבור שגיאת 422)
      Logger.info(`Original file size: ${(file.size / 1024).toFixed(2)} KB`);
      
      try {
        // תמיד מדחסים תמונות לפני העלאה כדי למנוע שגיאות
        const compressedFile = await compressImage(file, 1500); // מגבלה בקילובייטים
        
        Logger.info(`Compressed file size: ${(compressedFile.size / 1024).toFixed(2)} KB`);
        
        // העלאת הקובץ לאחר דחיסה
        const { data, error: uploadError } = await supabase.storage
          .from('ad-images')
          .upload(fileName, compressedFile, {
            cacheControl: '3600',
            contentType: 'image/jpeg', // אנו מוודאים שסוג התוכן תקין
            upsert: false
          });

        if (uploadError) {
          // טיפול בשגיאת 422
          if (uploadError.message.includes('422')) {
            Logger.error(`HTTP 422 Error: ${uploadError.message}`);
            toast.error('Upload failed: Your image might be too large or in an unsupported format');
            
            // ניסיון נוסף עם דחיסה גבוהה יותר
            const heavilyCompressedFile = await compressImage(file, 800);
            Logger.info(`Heavily compressed file size: ${(heavilyCompressedFile.size / 1024).toFixed(2)} KB`);
            
            const { data: retryData, error: retryError } = await supabase.storage
              .from('ad-images')
              .upload(`retry-${fileName}`, heavilyCompressedFile, {
                cacheControl: '3600',
                contentType: 'image/jpeg',
                upsert: false
              });
            
            if (retryError) {
              Logger.error(`Retry upload failed: ${retryError.message}`);
              toast.error('Failed to upload image even after compression');
              return URL.createObjectURL(heavilyCompressedFile);
            }
            
            // קבלת URL לתמונה המדוחסת שהצליחה לעלות
            const { data: { publicUrl } } = supabase.storage
              .from('ad-images')
              .getPublicUrl(`retry-${fileName}`);
            
            Logger.info(`Successfully uploaded compressed image: ${publicUrl}`);
            return publicUrl;
            
          } else {
            Logger.error(`Upload error: ${uploadError.message}`);
            toast.error(`Upload failed: ${uploadError.message}`);
            return URL.createObjectURL(compressedFile);
          }
        }

        // קבלת URL ציבורי לתמונה שהועלתה
        const { data: { publicUrl } } = supabase.storage
          .from('ad-images')
          .getPublicUrl(fileName);

        Logger.info(`Generated public URL: ${publicUrl}`);
        
        // וידוא שה-URL אכן פעיל
        try {
          const response = await fetch(publicUrl, { method: 'HEAD' });
          if (!response.ok) {
            Logger.warn(`Public URL check failed: ${response.status} ${response.statusText}`);
          }
        } catch (urlCheckError) {
          Logger.warn(`Failed to verify public URL: ${urlCheckError instanceof Error ? urlCheckError.message : String(urlCheckError)}`);
        }
        
        return publicUrl;
      } catch (compressionError) {
        Logger.error(`Compression error: ${compressionError instanceof Error ? compressionError.message : String(compressionError)}`);
        toast.error('Failed to process image. Trying with original image...');
        
        // ניסיון העלאה עם הקובץ המקורי כגיבוי
        const { error: originalUploadError, data } = await supabase.storage
          .from('ad-images')
          .upload(`original-${fileName}`, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (originalUploadError) {
          Logger.error(`Original file upload error: ${originalUploadError.message}`);
          toast.error('Upload failed completely');
          return URL.createObjectURL(file);
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('ad-images')
          .getPublicUrl(`original-${fileName}`);
        
        return publicUrl;
      }
    } catch (error) {
      Logger.error(`Error in handleSubmission: ${error instanceof Error ? error.message : String(error)}`);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return URL.createObjectURL(file);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmission,
    isSubmitting
  };
};
