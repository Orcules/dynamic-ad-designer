import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdSubmissionHandlerProps {
  onSubmit: (adData: any) => void;
  children: React.ReactNode;
}

const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .toLowerCase();               // Convert to lowercase
};

export const useAdSubmission = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmission = async (
    adData: any,
    imageFile: File,
    previewFile: File,
    onSuccess: (newAd: any) => void
  ) => {
    try {
      const timestamp = Date.now();
      const sanitizedFileName = sanitizeFileName(imageFile.name);
      const originalPath = `original/${timestamp}_${sanitizedFileName}`;
      const previewPath = `generated/${timestamp}_preview.jpg`;

      // Upload original image
      const { error: originalError } = await supabase.storage
        .from('ad-images')
        .upload(originalPath, imageFile);

      if (originalError) throw originalError;

      // Upload preview
      const { error: previewError } = await supabase.storage
        .from('ad-images')
        .upload(previewPath, previewFile);

      if (previewError) throw previewError;

      // Get preview URL
      const { data: { publicUrl: previewUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(previewPath);

      // Create ad record
      const { data: newAd, error: createError } = await supabase
        .from('generated_ads')
        .insert([{
          ...adData,
          image_url: previewUrl,
          status: 'completed',
          cta_color: adData.cta_color || '#4A90E2',
          overlay_color: adData.overlay_color || '#000000'
        }])
        .select()
        .single();

      if (createError) throw createError;

      onSuccess(newAd);
      toast.success('Ad created successfully!');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Error creating ad');
      throw error;
    }
  };

  return { isGenerating, setIsGenerating, handleSubmission };
};

export const AdSubmissionHandler: React.FC<AdSubmissionHandlerProps> = ({ 
  onSubmit, 
  children 
}) => {
  const { isGenerating, setIsGenerating, handleSubmission } = useAdSubmission();

  return (
    <div className="space-y-4">
      {typeof children === 'function' 
        ? children({ isGenerating, handleSubmission }) 
        : children}
    </div>
  );
};