import { useState } from 'react';
import { toast } from "sonner";
import { fetchWithRetry } from "@/utils/adSubmissionUtils";
import { AdStorageService } from "@/services/adStorageService";
import { AdGenerationService } from "@/services/adGenerationService";
import { capturePreview } from "@/utils/adPreviewCapture";

type RenderProps = {
  isGenerating: boolean;
  handleSubmission: (
    adData: any,
    imageFile: File | string,
    previewRef: React.RefObject<HTMLDivElement>,
    onSuccess: (newAd: any) => void,
    setIsGenerating: (value: boolean) => void
  ) => Promise<void>;
};

interface AdSubmissionHandlerProps {
  onSubmit: (adData: any) => void;
  children: React.ReactNode | ((props: RenderProps) => React.ReactNode);
}

export const useAdSubmission = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmission = async (
    adData: any,
    imageFile: File | string,
    previewRef: React.RefObject<HTMLDivElement>,
    onSuccess: (newAd: any) => void,
    setIsGenerating: (value: boolean) => void
  ) => {
    if (!imageFile) {
      toast.error('Please select an image');
      return;
    }

    if (!previewRef.current) {
      toast.error('Preview element not found');
      return;
    }

    const uploadId = crypto.randomUUID();
    const uploadedFiles: string[] = [];
    
    setIsGenerating(true);
    
    try {
      console.log(`Starting ad generation process [${uploadId}]`, { adData });
      
      // Prepare the image
      let imageBlob: Blob;
      if (imageFile instanceof File) {
        imageBlob = imageFile;
        console.log(`Using uploaded file [${uploadId}]`);
      } else {
        console.log(`Fetching image from URL [${uploadId}]:`, imageFile);
        const response = await fetchWithRetry(imageFile);
        imageBlob = await response.blob();
      }
      
      // Upload original image
      const { path: originalPath } = await AdStorageService.uploadOriginalImage(
        imageBlob,
        imageFile instanceof File ? imageFile.name : 'image.jpg',
        uploadId
      );
      uploadedFiles.push(originalPath);
      
      // Create and save preview
      console.log(`Capturing preview [${uploadId}]`);
      const previewFile = await capturePreview(previewRef, adData.platform);
      if (!previewFile) {
        throw new Error('Failed to capture preview');
      }

      const { path: previewPath } = await AdStorageService.uploadPreviewImage(previewFile, uploadId);
      uploadedFiles.push(previewPath);
      
      // Generate ad
      const { imageUrl } = await AdGenerationService.generateAd(adData, imageBlob);
      
      // Save ad to database
      const newAd = await AdGenerationService.saveAdToDatabase(adData, imageUrl);
      
      toast.success('Ad created successfully!', {
        action: {
          label: 'View Ad',
          onClick: () => window.open(imageUrl, '_blank')
        },
      });
      
      onSuccess(newAd);
      
    } catch (error: any) {
      console.error(`Error in handleAdSubmission [${uploadId}]:`, error);
      
      // Clean up uploaded files in case of error
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
};

export const AdSubmissionHandler: React.FC<AdSubmissionHandlerProps> = ({ 
  onSubmit, 
  children 
}) => {
  const { isGenerating, handleSubmission } = useAdSubmission();

  const renderProps: RenderProps = {
    isGenerating,
    handleSubmission
  };

  return (
    <div className="space-y-4">
      {typeof children === 'function' 
        ? (children as (props: RenderProps) => React.ReactNode)(renderProps)
        : children}
    </div>
  );
};