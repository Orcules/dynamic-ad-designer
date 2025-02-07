
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmission = async (file: File) => {
    try {
      setIsSubmitting(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ad-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('ad-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error in handleSubmission:', error);
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
