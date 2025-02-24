
import { toast } from "sonner";
import { getDimensions } from "./adDimensions";
import { supabase } from "@/integrations/supabase/client";
import { ImageGenerator } from "./ImageGenerator";

interface Position {
  x: number;
  y: number;
}

interface AdPositions {
  headlinePosition: Position;
  descriptionPosition: Position;
  ctaPosition: Position;
  imagePosition: Position;
}

export const processImages = async (
  adData: any,
  images: (File | string)[],
  previewRef: React.RefObject<HTMLDivElement>,
  onAdGenerated: (adData: any) => void,
  handleSubmission: any,
  setIsGenerating: (value: boolean) => void,
  positions: AdPositions
) => {
  console.log("Starting to process images:", images.length);
  console.log("Using positions:", positions);
  let successCount = 0;
  let retryCount = 0;
  const maxRetries = 3;
  const imageGenerator = new ImageGenerator('.ad-content');
  
  for (let i = 0; i < images.length; i++) {
    const currentImage = images[i];
    console.log(`Processing image ${i + 1}/${images.length}`);

    while (retryCount < maxRetries) {
      try {
        if (!previewRef.current) {
          throw new Error('Preview element not found');
        }

        // Capture preview
        const previewUrl = await imageGenerator.getImageUrl();
        console.log('Generated preview URL:', previewUrl);

        // Convert base64 URL to file
        const response = await fetch(previewUrl);
        const blob = await response.blob();
        const previewFile = new File([blob], `preview_${i + 1}.png`, { type: 'image/png' });

        // Upload to storage with retry mechanism
        const publicUrl = await handleSubmission(previewFile);
        console.log('Uploaded to storage:', publicUrl);

        const { width, height } = getDimensions(adData.platform);

        // Add ad to table with retry mechanism
        const { data: insertedAd, error: insertError } = await supabase
          .from('generated_ads')
          .insert([{
            name: `${adData.headline || 'Untitled'} - Version ${i + 1}`,
            headline: adData.headline,
            description: adData.description,
            cta_text: adData.cta_text,
            font_url: adData.font_url,
            platform: adData.platform,
            template_style: adData.template_style,
            accent_color: adData.accent_color,
            cta_color: adData.cta_color,
            overlay_color: adData.overlay_color,
            text_color: adData.text_color,
            description_color: adData.description_color,
            image_url: typeof currentImage === 'string' ? currentImage : publicUrl,
            preview_url: publicUrl,
            width,
            height,
            status: 'completed'
          }])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        if (insertedAd) {
          successCount++;
          onAdGenerated(insertedAd);
          console.log(`Successfully inserted ad ${i + 1}`);
          break; // Break the retry loop on success
        }

      } catch (error) {
        console.error(`Error processing image ${i + 1} (attempt ${retryCount + 1}):`, error);
        retryCount++;
        
        if (retryCount === maxRetries) {
          toast.error(`Failed to process image ${i + 1} after ${maxRetries} attempts`);
        } else {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          continue;
        }
      }
    }
    retryCount = 0; // Reset retry count for next image
  }
  
  if (successCount > 0) {
    toast.success(`Successfully created ${successCount} ads!`);
  } else {
    toast.error('No ads were created. Please check the errors and try again.');
  }
};
