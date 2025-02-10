
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAdSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmission = async (file: File) => {
    try {
      setIsSubmitting(true);
      
      // Log file details for debugging
      console.log('Starting file upload:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Attempting upload with path:', filePath);

      const { error: uploadError, data } = await supabase.storage
        .from('ad-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(filePath);

      console.log('Generated public URL:', publicUrl);
      return publicUrl;
      
    } catch (error) {
      console.error('Error in handleSubmission:', error);
      toast.error(`Upload failed: ${error.message}`);
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
