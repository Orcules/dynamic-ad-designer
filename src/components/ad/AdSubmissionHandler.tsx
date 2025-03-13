
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
        const response = await fetchWithRetry(imageFile);
        imageBlob = await response.blob();
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
      
      // Clear references to help garbage collection
      imageBlob = null as any;
      
    } catch (error: any) {
      console.error(`Error in handleSubmission [${uploadId}]:`, error);
      
      if (uploadedFiles.current.length > 0) {
        console.log(`Cleaning up uploaded files [${uploadId}]...`);
        await Promise.all(
          uploadedFiles.current.map(filePath => AdStorageService.deleteFile(filePath))
        );
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
