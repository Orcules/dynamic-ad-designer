
import { toast } from "sonner";
import { getDimensions } from "./adDimensions";
import { supabase } from "@/integrations/supabase/client";
import { ImageGenerator } from "./ImageGenerator";
import { Logger } from "@/utils/logger"; // Fixed import path

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
  Logger.info(`Starting to process ${images.length} images`);
  Logger.info(`Using positions: ${JSON.stringify(positions)}`);
  
  let successCount = 0;
  let retryCount = 0;
  const maxRetries = 3;
  const imageGenerator = new ImageGenerator('.ad-content');
  
  for (let i = 0; i < images.length; i++) {
    const currentImage = images[i];
    Logger.info(`Processing image ${i + 1}/${images.length}`);

    while (retryCount < maxRetries) {
      try {
        if (!previewRef.current) {
          Logger.error('Preview element not found');
          throw new Error('Preview element not found');
        }

        // Capture preview
        Logger.info('Generating preview image...');
        const previewUrl = await imageGenerator.getImageUrl();
        Logger.info('Preview URL generated successfully');

        // Convert base64 URL to file
        Logger.info('Converting preview to file...');
        const response = await fetch(previewUrl);
        const blob = await response.blob();
        const previewFile = new File([blob], `preview_${i + 1}.png`, { type: 'image/png' });
        Logger.info('Preview file created successfully');

        // Upload to storage with retry mechanism
        Logger.info('Uploading to storage...');
        const publicUrl = await handleSubmission(previewFile);
        Logger.info(`Upload successful, public URL: ${publicUrl}`);

        const { width, height } = getDimensions(adData.platform);
        Logger.info(`Using dimensions: ${width}x${height} for platform ${adData.platform}`);

        // Add ad to table with retry mechanism
        Logger.info('Inserting ad data into database...');
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
          Logger.error(`Database insertion error: ${insertError.message}`);
          throw insertError;
        }

        if (insertedAd) {
          successCount++;
          Logger.info(`Successfully inserted ad ${i + 1} with ID: ${insertedAd.id}`);
          onAdGenerated(insertedAd);
          break; // Break the retry loop on success
        }

      } catch (error) {
        Logger.error(`Error processing image ${i + 1} (attempt ${retryCount + 1}): ${error instanceof Error ? error.message : String(error)}`);
        retryCount++;
        
        if (retryCount === maxRetries) {
          Logger.error(`Failed to process image ${i + 1} after ${maxRetries} attempts`);
          toast.error(`Failed to process image ${i + 1} after ${maxRetries} attempts`);
        } else {
          // Wait before retrying (exponential backoff)
          const backoffTime = Math.pow(2, retryCount) * 1000;
          Logger.info(`Retrying in ${backoffTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          continue;
        }
      }
    }
    retryCount = 0; // Reset retry count for next image
  }
  
  if (successCount > 0) {
    Logger.info(`Processing completed. Successfully created ${successCount} ads`);
    toast.success(`Successfully created ${successCount} ads!`);
  } else {
    Logger.error('No ads were created successfully');
    toast.error('No ads were created. Please check the errors and try again.');
  }
};
