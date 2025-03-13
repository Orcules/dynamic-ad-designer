
import { useState, useRef } from 'react';
import { toast } from "sonner";
import { fetchWithRetry } from "@/utils/adSubmissionUtils";
import { AdStorageService } from "@/services/adStorageService";
import { AdGenerationService } from "@/services/adGenerationService";

export function useAdSubmission() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const uploadedFiles = useRef<string[]>([]);

  const handleSubmission = async (
    adData: any,
    imageFile: File | string,
    previewRef: React.RefObject<HTMLDivElement>,
    onSuccess: (newAd: any) => void
  ) => {
    setIsGenerating(true);
    setIsSubmitting(true);
    const uploadId = crypto.randomUUID();
    uploadedFiles.current = [];
    
    try {
      console.log(`Starting ad generation process [${uploadId}]`, { adData });
      
      let imageBlob: Blob;
      if (imageFile instanceof File) {
        imageBlob = imageFile;
        console.log(`Using uploaded file [${uploadId}]`);
      } else {
        console.log(`Fetching image from URL [${uploadId}]:`, imageFile);
        // Add timeout to prevent hanging fetch requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        try {
          const response = await fetchWithRetry(imageFile, { signal: controller.signal });
          clearTimeout(timeoutId);
          imageBlob = await response.blob();
        } catch (fetchError) {
          clearTimeout(timeoutId);
          console.error(`Fetch error [${uploadId}]:`, fetchError);
          throw new Error(`Failed to fetch image: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
        }
      }
      
      const { path: originalPath } = await AdStorageService.uploadOriginalImage(
        imageBlob,
        imageFile instanceof File ? imageFile.name : 'image.jpg',
        uploadId
      );
      uploadedFiles.current.push(originalPath);

      const { imageUrl } = await AdGenerationService.generateAd(adData, imageBlob);
      
      toast.success('Ad created successfully!', {
        action: {
          label: 'View Ad',
          onClick: () => window.open(imageUrl, '_blank')
        },
      });
      
      onSuccess({ ...adData, imageUrl });
      
      // Help garbage collection
      imageBlob = null as any;
      
    } catch (error: any) {
      console.error(`Error in handleSubmission [${uploadId}]:`, error);
      
      if (uploadedFiles.current.length > 0) {
        console.log(`Cleaning up uploaded files [${uploadId}]...`);
        try {
          await Promise.all(
            uploadedFiles.current.map(filePath => AdStorageService.deleteFile(filePath))
          );
        } catch (cleanupError) {
          console.error(`Cleanup error [${uploadId}]:`, cleanupError);
        }
      }
      
      toast.error(error.message || 'Error creating ad');
    } finally {
      setIsGenerating(false);
      setIsSubmitting(false);
      // Clear references
      uploadedFiles.current = [];
    }
  };

  return { isGenerating, isSubmitting, handleSubmission };
}
