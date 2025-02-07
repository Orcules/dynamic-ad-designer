
import { useState } from 'react';
import { toast } from "sonner";
import { fetchWithRetry } from "@/utils/adSubmissionUtils";
import { AdStorageService } from "@/services/adStorageService";
import { AdGenerationService } from "@/services/adGenerationService";
import { capturePreview } from "@/utils/adPreviewCapture";

type RenderProps = {
  isGenerating: boolean;
  handleSubmission: (adData: any, imageFile: File, previewFile: File, onSuccess: (newAd: any) => void) => Promise<void>;
};

interface AdSubmissionHandlerProps {
  onSubmit: (adData: any) => void;
  children: React.ReactNode | ((props: RenderProps) => React.ReactNode);
}

export const useAdSubmission = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmission = async (
    adData: any,
    imageFile: File,
    previewRef: React.RefObject<HTMLDivElement>,
    onSuccess: (newAd: any) => void
  ) => {
    if (!imageFile) {
      toast.error('Please select an image');
      return;
    }

    const uploadId = crypto.randomUUID();
    const uploadedFiles: string[] = [];
    
    setIsGenerating(true);
    
    try {
      console.log(`Starting ad generation process [${uploadId}]`, { adData });
      
      // הכנת התמונה
      let imageBlob: Blob;
      if (imageFile instanceof File) {
        imageBlob = imageFile;
        console.log(`Using uploaded file [${uploadId}]`);
      } else {
        console.log(`Fetching image from URL [${uploadId}]:`, imageFile);
        const response = await fetchWithRetry(imageFile);
        imageBlob = await response.blob();
      }
      
      // העלאת התמונה המקורית
      const { path: originalPath, url: originalUrl } = await AdStorageService.uploadOriginalImage(
        imageBlob,
        imageFile instanceof File ? imageFile.name : 'image.jpg',
        uploadId
      );
      uploadedFiles.push(originalPath);
      
      // יצירת ושמירת תצוגה מקדימה
      const previewFile = await capturePreview(previewRef, adData.platform);
      if (!previewFile) {
        throw new Error('Failed to capture preview');
      }

      const { path: previewPath } = await AdStorageService.uploadPreviewImage(previewFile, uploadId);
      uploadedFiles.push(previewPath);
      
      // יצירת המודעה
      const { imageUrl } = await AdGenerationService.generateAd(adData, imageBlob);
      
      // שמירת המודעה במסד הנתונים
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
      
      // ניקוי קבצים שהועלו במקרה של שגיאה
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

  return { isGenerating, setIsGenerating, handleSubmission };
};

export const AdSubmissionHandler: React.FC<AdSubmissionHandlerProps> = ({ 
  onSubmit, 
  children 
}) => {
  const { isGenerating, setIsGenerating, handleSubmission } = useAdSubmission();

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
