
import { toast } from "sonner";
import { getDimensions } from "./adDimensions";
import { supabase } from "@/integrations/supabase/client";
import { ImageGenerator } from "./ImageGenerator";
import { Logger } from "@/utils/logger";
import { calculateCoverDimensions } from "./imageEffects";

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
  const processedBlobUrls = new Set<string>(); // Track processed blob URLs as well
  const processedImageHashes = new Map<string, string>(); // Track image content hashes
  const imageGenerator = new ImageGenerator('.ad-content');
  const navigationLock = { locked: false };
  
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
  
  // Helper function to generate a simple hash for an image preview
  const generatePreviewHash = async (previewUrl: string): Promise<string> => {
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Use a small portion of the data for quick comparison
          const data = reader.result as string;
          const sample = data.substring(0, 1000) + data.substring(data.length - 1000);
          resolve(sample);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      Logger.error(`Error generating preview hash: ${error instanceof Error ? error.message : String(error)}`);
      return '';
    }
  };
  
  // Check if an image preview is a duplicate of a previously processed one
  const isDuplicatePreview = async (previewUrl: string): Promise<boolean> => {
    try {
      const hash = await generatePreviewHash(previewUrl);
      
      // If hash is empty, don't consider it a duplicate
      if (!hash) return false;
      
      // Check if this hash matches any previously processed image
      for (const [url, existingHash] of processedImageHashes.entries()) {
        if (existingHash === hash) {
          Logger.warn(`Duplicate preview detected: ${previewUrl.substring(0, 30)}... matches ${url.substring(0, 30)}...`);
          return true;
        }
      }
      
      // Store this hash
      processedImageHashes.set(previewUrl, hash);
      return false;
    } catch (error) {
      Logger.error(`Error checking for duplicate preview: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };
  
  // Navigation lock helper - prevents rapid navigation during processing
  const acquireNavigationLock = () => {
    if (navigationLock.locked) {
      Logger.warn("Navigation lock already acquired, waiting...");
      return false;
    }
    
    navigationLock.locked = true;
    return true;
  };
  
  const releaseNavigationLock = () => {
    if (!navigationLock.locked) {
      Logger.warn("Attempted to release an unlocked navigation lock");
      return;
    }
    
    // Small delay to prevent immediate reacquisition 
    setTimeout(() => {
      navigationLock.locked = false;
      Logger.info("Navigation lock released");
    }, 200);
  };
  
  for (let i = 0; i < uniqueImages.length; i++) {
    const currentImage = uniqueImages[i];
    Logger.info(`Processing image ${i + 1}/${uniqueImages.length}: ${typeof currentImage === 'string' ? currentImage.substring(0, 30) + '...' : currentImage.name}`);
    
    // Skip if we've already processed this image URL
    if (typeof currentImage === 'string' && processedImageUrls.has(currentImage)) {
      Logger.warn(`Skipping duplicate image at index ${i}: ${currentImage.substring(0, 30)}...`);
      continue;
    }
    
    // Ensure sufficient delay between processing each image for smooth navigation
    if (i > 0) {
      Logger.info(`Adding delay before processing next image (${i})`);
      await new Promise(resolve => setTimeout(resolve, 1800)); // Increased for smoother transitions
    }
    
    if (!acquireNavigationLock()) {
      Logger.warn(`Skipping image at index ${i} due to navigation lock`);
      await new Promise(resolve => setTimeout(resolve, 800));
      i--; // Retry this index
      continue;
    }
    
    let retryCount = 0;
    const maxRetries = 3;
    let success = false;

    while (retryCount < maxRetries && !success) {
      try {
        if (!previewRef.current) {
          Logger.error('Preview element not found');
          throw new Error('Preview element not found');
        }

        // Wait longer before capturing to ensure image is fully loaded and transitions are complete
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Capture preview
        Logger.info('Generating preview image...');
        const previewUrl = await imageGenerator.getImageUrl();
        Logger.info('Preview URL generated successfully');
        
        // Check if this blob URL has already been processed (same preview)
        if (processedBlobUrls.has(previewUrl)) {
          Logger.warn(`Skipping duplicate blob URL: ${previewUrl.substring(0, 30)}...`);
          throw new Error('Duplicate preview detected - skipping to prevent duplicate ad');
        }
        
        // Check if this preview is visually similar to any previously processed one
        const isDuplicate = await isDuplicatePreview(previewUrl);
        if (isDuplicate) {
          Logger.warn(`Skipping visually duplicate preview: ${previewUrl.substring(0, 30)}...`);
          throw new Error('Visually duplicate preview detected - skipping to prevent duplicate ad');
        }
        
        processedBlobUrls.add(previewUrl);

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

        // Create fixed stable positions - this prevents text from moving around
        const stablePositions = {
          headlinePosition: { x: 0, y: 0 },
          descriptionPosition: { x: 0, y: 10 },
          ctaPosition: { x: 0, y: 0 },
          imagePosition: positions.imagePosition
        };

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
            image_position: positions.imagePosition, // Store positioning data
            headline_position: stablePositions.headlinePosition,
            description_position: stablePositions.descriptionPosition,
            cta_position: stablePositions.ctaPosition,
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
          
          // Log that this index has been processed
          Logger.info(`Marked index ${i} as processed. Total processed: ${successCount}/${uniqueImages.length}`);
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
        }
      } finally {
        // Always release navigation lock at the end of processing attempt
        releaseNavigationLock();
      }
    }
    
    // Ensure that the next image is properly loaded before continuing to next image
    if (success && i < uniqueImages.length - 1) {
      Logger.info(`Waiting for UI to refresh before processing next image...`);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Increased for smoother transitions
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
