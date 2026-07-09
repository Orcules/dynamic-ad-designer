
import { useState } from 'react';
import { toast } from "sonner";
import { fetchWithRetry } from "@/utils/adSubmissionUtils";
import { AdStorageService } from "@/services/adStorageService";
import { AdGenerationService } from "@/services/adGenerationService";

export function useAdSubmission() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmission = async (
    adData: any,
    imageFile: File | string,
    previewRef: React.RefObject<HTMLDivElement>,
    onSuccess: (newAd: any) => void
  ) => {
    setIsGenerating(true);
    const uploadId = crypto.randomUUID();
    const uploadedFiles: string[] = [];
    
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
      uploadedFiles.push(originalPath);

      const { imageUrl } = await AdGenerationService.generateAd(adData, imageBlob);
      
      toast.success('Ad created successfully!', {
        action: {
          label: 'View Ad',
          onClick: () => window.open(imageUrl, '_blank')
        },
      });
      
      onSuccess({ ...adData, imageUrl });
      
    } catch (error: any) {
      console.error(`Error in handleSubmission [${uploadId}]:`, error);
      
      if (uploadedFiles.length > 0) {
        console.log(`Cleaning up uploaded files [${uploadId}]...`);
        await Promise.all(
          uploadedFiles.map(filePath => AdStorageService.deleteFile(filePath))
        );
      }
      
      toast.error(error.message || 'Error creating ad');
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGenerating, handleSubmission };
}
