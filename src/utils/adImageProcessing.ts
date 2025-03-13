
import { toast } from "sonner";
import { getDimensions } from "./adDimensions";
import { supabase } from "@/integrations/supabase/client";
import { ImageGenerator } from "./ImageGenerator";
import { Logger } from "@/utils/logger";

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
  const processedImageUrls = new Set<string>(); // Track processed image URLs to prevent duplicates
  const imageGenerator = new ImageGenerator('.ad-content');
  
  // First, deduplicate the image array to ensure each image is unique
  const uniqueImages: (File | string)[] = [];
  const uniqueImageMap = new Map<string, boolean>();
  
  images.forEach(img => {
    const imageKey = typeof img === 'string' ? img : img.name + img.size + img.lastModified;
    if (!uniqueImageMap.has(imageKey)) {
      uniqueImageMap.set(imageKey, true);
      uniqueImages.push(img);
    } else {
      Logger.warn(`Skipping duplicate image: ${typeof img === 'string' ? img.substring(0, 30) + '...' : img.name}`);
    }
  });
  
  Logger.info(`Deduplicated image array: ${images.length} -> ${uniqueImages.length}`);
  
  for (let i = 0; i < uniqueImages.length; i++) {
    const currentImage = uniqueImages[i];
    Logger.info(`Processing image ${i + 1}/${uniqueImages.length}: ${typeof currentImage === 'string' ? currentImage.substring(0, 30) + '...' : currentImage.name}`);
    
    // Skip if we've already processed this image URL
    if (typeof currentImage === 'string' && processedImageUrls.has(currentImage)) {
      Logger.warn(`Skipping duplicate image at index ${i}: ${currentImage.substring(0, 30)}...`);
      continue;
    }
    
    // Ensure sufficient delay between processing each image
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    let success = false;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount < maxRetries && !success) {
      try {
        if (!previewRef.current) {
          Logger.error('Preview element not found');
          throw new Error('Preview element not found');
        }

        // Wait before capturing to ensure image is fully loaded
        await new Promise(resolve => setTimeout(resolve, 300));
        
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

        // Upload to storage
        Logger.info('Uploading to storage...');
        const publicUrl = await handleSubmission(previewFile);
        Logger.info(`Upload successful, public URL: ${publicUrl}`);

        const { width, height } = getDimensions(adData.platform);
        Logger.info(`Using dimensions: ${width}x${height} for platform ${adData.platform}`);

        // CRITICAL: Use the exact image position from the preview
        Logger.info(`Using exact image position: ${JSON.stringify(positions.imagePosition)}`);

        // Add ad to table
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
            image_position: positions.imagePosition,
            headline_position: positions.headlinePosition,
            description_position: positions.descriptionPosition,
            cta_position: positions.ctaPosition,
            status: 'completed',
            created_at: new Date().toISOString()
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
          
          // Mark this image URL as processed to prevent duplicates
          if (typeof currentImage === 'string') {
            processedImageUrls.add(currentImage);
          }
          
          success = true;
        }

      } catch (error) {
        Logger.error(`Error processing image ${i + 1} (attempt ${retryCount + 1}): ${error instanceof Error ? error.message : String(error)}`);
        retryCount++;
        
        if (retryCount === maxRetries) {
          Logger.error(`Failed to process image ${i + 1} after ${maxRetries} attempts`);
          toast.error(`Failed to process image ${i + 1}`);
        } else {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // Wait before processing next image
    if (success && i < uniqueImages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }
  
  if (successCount > 0) {
    Logger.info(`Processing completed. Successfully created ${successCount} ads`);
    toast.success(`Successfully created ${successCount} ads!`);
  } else {
    Logger.error('No ads were created successfully');
    toast.error('No ads were created. Please check the errors and try again.');
  }
};
