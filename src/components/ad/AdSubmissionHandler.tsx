import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getDimensions } from "@/utils/adDimensions";

type RenderProps = {
  isGenerating: boolean;
  handleSubmission: (adData: any, imageFile: File, previewFile: File, onSuccess: (newAd: any) => void) => Promise<void>;
};

interface AdSubmissionHandlerProps {
  onSubmit: (adData: any) => void;
  children: React.ReactNode | ((props: RenderProps) => React.ReactNode);
}

const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
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
      const dimensions = getDimensions(adData.platform);
      const enrichedAdData = { 
        ...adData,
        ...dimensions,
        status: 'pending'
      };

      // Create the ad record first
      const { data: newAd, error: createError } = await supabase
        .from('generated_ads')
        .insert([enrichedAdData])
        .select()
        .single();

      if (createError) throw createError;

      // Prepare form data for the generate-ad function
      const formData = new FormData();
      formData.append('data', JSON.stringify(enrichedAdData));
      formData.append('image', imageFile);

      // Call the generate-ad function
      const response = await fetch('/api/generate-ad', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate ad');
      }

      const { imageUrl } = await response.json();

      toast.success('Ad created successfully!', {
        action: {
          label: 'View Ad',
          onClick: () => window.open(imageUrl, '_blank')
        },
      });

      onSuccess({ ...newAd, image_url: imageUrl });

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

  const renderProps: RenderProps = {
    isGenerating,
    handleSubmission
  };

  return (
    <div className="space-y-4">
      {typeof children === 'function' 
        ? (children as (props: RenderProps) => React.ReactNode)(renderProps)
        : children}
    </div>
  );
};