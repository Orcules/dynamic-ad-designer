
import { toast } from "sonner";
import { getDimensions } from "./adDimensions";
import { supabase } from "@/integrations/supabase/client";

export const processImages = async (
  adData: any,
  images: (File | string)[],
  previewRef: React.RefObject<HTMLDivElement>,
  onAdGenerated: (adData: any) => void,
  handleSubmission: any,
  setIsGenerating: (value: boolean) => void
) => {
  console.log("Starting to process images:", images.length);
  let successCount = 0;
  
  for (let i = 0; i < images.length; i++) {
    const currentImage = images[i];
    console.log(`Processing image ${i + 1}/${images.length}`);

    try {
      let imageUrl: string;
      let imageBlob: Blob;
      
      if (typeof currentImage === 'string') {
        // Fetch image from URL
        const response = await fetch(currentImage);
        if (!response.ok) {
          throw new Error(`Failed to access image URL: ${currentImage}`);
        }
        imageBlob = await response.blob();
        imageUrl = currentImage;
      } else {
        imageBlob = currentImage;
        imageUrl = await handleSubmission(currentImage);
      }

      if (!imageUrl) {
        throw new Error('No image URL generated');
      }

      const { width, height } = getDimensions(adData.platform);
      
      const formData = new FormData();
      formData.append('image', imageBlob);
      formData.append('data', JSON.stringify({
        ...adData,
        width,
        height
      }));

      // Call the generate-ad function
      const { data: generatedData, error: generateError } = await supabase.functions
        .invoke('generate-ad', {
          body: formData
        });

      if (generateError) {
        throw generateError;
      }

      if (!generatedData?.imageUrl) {
        throw new Error('No generated image URL received');
      }

      // Create a unique name for each ad based on the original data
      const enrichedAdData = {
        name: `${adData.headline || 'Untitled'} - Version ${i + 1}`,
        headline: adData.headline,
        description: adData.description,
        cta_text: adData.cta_text,
        font_url: adData.font_url,
        platform: adData.platform,
        template_style: adData.template_style || 'modern',
        accent_color: adData.accent_color || '#4A90E2',
        cta_color: adData.cta_color || '#4A90E2',
        overlay_color: adData.overlay_color || '#000000',
        text_color: adData.text_color || '#FFFFFF',
        description_color: adData.description_color || '#333333',
        image_url: generatedData.imageUrl,
        width,
        height,
        status: 'completed'
      };

      // Insert the ad into the database
      const { data: insertedAd, error: insertError } = await supabase
        .from('generated_ads')
        .insert([enrichedAdData])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      if (insertedAd) {
        successCount++;
        onAdGenerated(insertedAd);
        console.log(`Successfully inserted ad ${i + 1}`);
      }

    } catch (error) {
      console.error(`Error processing image ${i + 1}:`, error);
      toast.error(`Failed to process image ${i + 1}: ${error.message}`);
    }
  }
  
  if (successCount > 0) {
    toast.success(`Successfully created ${successCount} ads!`);
  } else {
    toast.error('No ads were created. Please check the errors and try again.');
  }
};
