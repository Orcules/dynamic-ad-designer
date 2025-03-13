
import { supabase } from "@/integrations/supabase/client";
import { getDimensions } from "@/utils/adDimensions";
import { Logger } from "@/utils/logger";

export interface GeneratedAdResult {
  imageUrl: string;
  previewUrl?: string;
  adData: any;
}

export class AdGenerationService {
  static async generateAd(adData: any, imageBlob: Blob): Promise<GeneratedAdResult> {
    const formData = new FormData();
    
    try {
      // Check if blob is valid
      if (!imageBlob || imageBlob.size === 0) {
        throw new Error('Invalid image: empty or corrupted file');
      }
      
      // Resize large images before uploading to prevent memory issues
      let processedBlob = imageBlob;
      if (imageBlob.size > 5 * 1024 * 1024) { // If larger than 5MB
        try {
          Logger.info(`Image is large (${(imageBlob.size / (1024 * 1024)).toFixed(2)}MB), resizing before upload`);
          processedBlob = await this.resizeImage(imageBlob, 2000); // Resize to max 2000px
        } catch (resizeError) {
          Logger.warn(`Failed to resize image: ${resizeError instanceof Error ? resizeError.message : String(resizeError)}`);
          // Continue with original blob if resize fails
        }
      }
      
      // Create a file from the blob
      const imageFile = new File([processedBlob], 'image.png', { type: 'image/png' });
      formData.append('image', imageFile);
      
      formData.append('data', JSON.stringify({
        ...adData,
        ...getDimensions(adData.platform),
        overlayOpacity: 0.4
      }));

      Logger.info('Sending to edge function:', {
        imageType: imageFile.type,
        imageSize: imageFile.size,
        data: adData
      });

      // Use a timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        // Fixed: Using only one argument as expected by the function signature
        const { data: generatedAd, error: generateError } = await supabase.functions.invoke('generate-ad', {
          body: formData
        });

        clearTimeout(timeoutId);
        
        if (generateError) {
          Logger.error('Generate ad error:', generateError);
          throw new Error(`Failed to generate ad: ${generateError.message}`);
        }

        if (!generatedAd || !generatedAd.imageUrl) {
          throw new Error('No image URL returned from server');
        }

        return {
          ...generatedAd,
          adData
        };
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        
        throw error;
      }
    } catch (error) {
      Logger.error(`Ad generation error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  // Improved image resizing with better error handling and memory management
  private static async resizeImage(blob: Blob, maxDimension: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);
      
      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > height && width > maxDimension) {
            height = Math.round(height * (maxDimension / width));
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round(width * (maxDimension / height));
            height = maxDimension;
          }
          
          // Create canvas and resize
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(objectUrl);
            return reject(new Error('Could not get canvas context'));
          }
          
          // Draw image with smoothing for better quality
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with improved error handling
          canvas.toBlob(
            (resizedBlob) => {
              // Always revoke object URL as soon as possible
              URL.revokeObjectURL(objectUrl);
              
              if (!resizedBlob) {
                reject(new Error('Failed to create resized blob'));
                return;
              }
              resolve(resizedBlob);
            },
            'image/jpeg',
            0.92
          );
        } catch (error) {
          URL.revokeObjectURL(objectUrl);
          reject(error);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image for resizing'));
      };
      
      // Set crossOrigin attribute for CORS-enabled images
      img.crossOrigin = 'anonymous';
      img.src = objectUrl;
    });
  }
}
