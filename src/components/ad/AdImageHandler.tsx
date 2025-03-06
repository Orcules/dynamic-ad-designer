
import { useState } from "react";
import { Logger } from "@/utils/logger";

interface AdImageHandlerProps {
  onImageChange: (urls: string[]) => void;
  onCurrentIndexChange: (index: number) => void;
}

export function useAdImageHandler({ 
  onImageChange, 
  onCurrentIndexChange 
}: AdImageHandlerProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/') && file.size > 0
      );
      
      if (files.length === 0) {
        Logger.warn('No valid image files selected');
        return;
      }
      
      setSelectedImages(prev => [...prev, ...files]);
      
      // יצירת URLs זמניים לתצוגה מקדימה
      const urls = files.map(file => URL.createObjectURL(file));
      
      // עדכון state באופן בטוח
      setImageUrls(prevUrls => {
        const newUrls = [...prevUrls, ...urls];
        // קריאה לקולבק אחרי עדכון
        setTimeout(() => onImageChange(newUrls), 0);
        return newUrls;
      });
      
      // עדכון האינדקס הנוכחי לתמונה הראשונה החדשה
      if (imageUrls.length === 0) {
        setCurrentPreviewIndex(0);
        onCurrentIndexChange(0);
      }
    }
  };

  const handleImageUrlsChange = (urls: string[]) => {
    try {
      // סינון URLs ריקים או לא תקינים
      const validUrls = urls.filter(url => url && url.trim() !== '' && url !== 'undefined');
      
      if (validUrls.length === 0) {
        Logger.warn('No valid image URLs provided');
        return;
      }
      
      // וידוא שכל הURLs הם HTTPS (אם לא ספציפית נדרש HTTP)
      const secureUrls = validUrls.map(url => {
        if (url.startsWith('http:') && !url.includes('localhost')) {
          return url.replace(/^http:/, 'https:');
        }
        return url;
      });
      
      setImageUrls(secureUrls);
      setCurrentPreviewIndex(0);
      onImageChange(secureUrls);
      onCurrentIndexChange(0);
    } catch (error) {
      Logger.error(`Error in handleImageUrlsChange: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handlePrevPreview = () => {
    if (imageUrls.length === 0) return;
    
    const newIndex = currentPreviewIndex > 0 ? currentPreviewIndex - 1 : imageUrls.length - 1;
    setCurrentPreviewIndex(newIndex);
    onCurrentIndexChange(newIndex);
  };

  const handleNextPreview = () => {
    if (imageUrls.length === 0) return;
    
    const newIndex = currentPreviewIndex < imageUrls.length - 1 ? currentPreviewIndex + 1 : 0;
    setCurrentPreviewIndex(newIndex);
    onCurrentIndexChange(newIndex);
  };

  return {
    selectedImages,
    imageUrls,
    currentPreviewIndex,
    handleImageChange,
    handleImageUrlsChange,
    handlePrevPreview,
    handleNextPreview,
    setCurrentPreviewIndex
  };
}
