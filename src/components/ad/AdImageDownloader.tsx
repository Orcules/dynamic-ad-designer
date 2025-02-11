
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useAdImageDownloader = () => {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleDownload = async () => {
    try {
      setIsCapturing(true);

      const timestamp = Date.now();
      const currentUrl = `${window.location.href}?t=${timestamp}`;

      const { data, error } = await supabase.functions.invoke('generate-preview', {
        body: {
          url: currentUrl,
          selector: '.ad-content'
        }
      });

      if (error) {
        console.error('Error calling generate-preview function:', error);
        toast.error('Error generating image');
        return;
      }

      if (!data?.image) {
        toast.error('No image data received');
        return;
      }

      const link = document.createElement('a');
      link.download = 'ad-preview.png';
      link.href = `data:image/png;base64,${data.image}`;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Error generating image');
    } finally {
      setIsCapturing(false);
    }
  };

  return {
    isCapturing,
    handleDownload
  };
};
