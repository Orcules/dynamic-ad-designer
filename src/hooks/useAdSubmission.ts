
import { useState } from 'react';
import { toast } from 'sonner';
import { Logger } from '@/utils/logger';
import { BucketService } from '@/services/bucketService';
import { EdgeFunctionService } from '@/services/edgeFunctionService';
import { dataUrlToFile, createMetadataFilename } from '@/utils/imageUtils';

export const useAdSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [bucketStatus, setBucketStatus] = useState<'unknown' | 'exists' | 'not_exists' | 'error'>('unknown');

  // Check if the bucket exists and update status
  const checkBucketStatus = async (): Promise<boolean> => {
    const { exists, error } = await BucketService.checkBucketStatus();
    
    if (error) {
      setLastError(`Bucket check error: ${error}`);
      setBucketStatus('error');
      return false;
    }
    
    setBucketStatus(exists ? 'exists' : 'not_exists');
    return exists;
  };

  // Create the bucket if it doesn't exist
  const createBucket = async (): Promise<boolean> => {
    const { success, error } = await BucketService.createBucket();
    
    if (error) {
      setLastError(`Bucket creation error: ${error}`);
      return false;
    }
    
    setBucketStatus('exists');
    return success;
  };

  // Main function to handle the entire upload process with expanded metadata parameters
  const handleSubmission = async (
    file: File, 
    renderedPreviewUrl?: string, 
    adName?: string,
    language?: string,
    fontName?: string,
    aspectRatio?: string,
    templateStyle?: string,
    version: number = 1
  ): Promise<string | null> => {
    setIsSubmitting(true);
    setLastError(null);
    
    try {
      Logger.info(`Starting file upload process for: ${file.name}, size: ${file.size}, type: ${file.type}`);
      
      // 1. Check if bucket exists
      let bucketReady = await checkBucketStatus();
      
      // 2. Try to create the bucket if it doesn't exist
      if (!bucketReady) {
        Logger.info('Bucket not ready, attempting to create it');
        bucketReady = await createBucket();
      }
      
      if (!bucketReady) {
        throw new Error('Could not access or create the storage bucket');
      }
      
      // 3. Generate unique identifiers for this upload
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const uploadId = `${timestamp}-${randomId}`;
      
      // 4. Handle rendered preview if available
      if (renderedPreviewUrl) {
        try {
          // Try to use the edge function with the rendered preview
          const previewFile = await dataUrlToFile(renderedPreviewUrl, `preview-${uploadId}.png`);
          if (!previewFile) {
            throw new Error('Failed to convert preview to file');
          }

          const { imageUrl, error } = await EdgeFunctionService.generateAd({
            image: file,
            renderedPreview: renderedPreviewUrl,
            headline: adName,
            language,
            fontName,
            aspectRatio,
            templateStyle,
            version
          });
          
          if (error) {
            Logger.warn(`Edge function failed, falling back to direct upload: ${error}`);
          } else if (imageUrl) {
            return imageUrl;
          }
          
          // If edge function fails, try direct upload of the preview
          Logger.info('Falling back to direct upload of preview');
          const { url: previewUrl, error: uploadError } = await BucketService.uploadFile(
            previewFile, 
            `${timestamp}-preview-${randomId}.png`, 
            adName
          );
          
          if (uploadError) {
            throw new Error(`Failed to upload preview: ${uploadError}`);
          }
          
          if (previewUrl) {
            Logger.info(`Successfully uploaded rendered preview directly: ${previewUrl}`);
            return previewUrl;
          }
        } catch (previewError) {
          Logger.error(`Preview processing failed: ${previewError instanceof Error ? previewError.message : String(previewError)}`);
          // Fall through to try other methods
        }
      }
      
      // 5. Try using the edge function in fast mode (without preview)
      try {
        Logger.info('Using edge function in fast mode');
        
        const { imageUrl, error } = await EdgeFunctionService.generateAd({
          image: file,
          headline: adName,
          language,
          fontName,
          aspectRatio,
          templateStyle,
          version
        });
        
        if (error) {
          Logger.warn(`Fast mode edge function failed: ${error}`);
        } else if (imageUrl) {
          return imageUrl;
        }
      } catch (fastModeError) {
        Logger.error(`Fast mode error: ${fastModeError instanceof Error ? fastModeError.message : String(fastModeError)}`);
        // Fall through to direct upload
      }
      
      // 6. If all else fails, try direct upload with metadata filename
      const filePath = createMetadataFilename(
        adName,
        language,
        fontName,
        aspectRatio,
        templateStyle,
        version,
        file.name.split('.').pop() || 'jpg'
      );
      
      const { url: uploadedUrl, error: uploadError } = await BucketService.uploadFile(file, filePath, adName);
      
      if (uploadError) {
        throw new Error(`Direct upload failed: ${uploadError}`);
      }
      
      if (uploadedUrl) {
        Logger.info(`Successfully uploaded file directly: ${uploadedUrl}`);
        return uploadedUrl;
      }
      
      throw new Error(`Could not upload image after multiple attempts. Last error: ${lastError || 'Unknown error'}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Fatal error in handleSubmission: ${errorMessage}`);
      setLastError(errorMessage);
      toast.error(`Upload failed: ${errorMessage}`);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Return functions and status
  return {
    handleSubmission,
    isSubmitting,
    lastError,
    bucketStatus,
    checkBucketStatus,
    createBucket
  };
};
