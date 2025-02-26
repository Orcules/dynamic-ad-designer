
import { useState } from "react";

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
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...files]);
      const urls = files.map(file => URL.createObjectURL(file));
      
      // Update the state first
      const newUrls = [...imageUrls, ...urls];
      setImageUrls(newUrls);
      
      // Then call the callback with only the new URLs to avoid infinite loop
      onImageChange(urls);
    }
  };

  const handleImageUrlsChange = (urls: string[]) => {
    const secureUrls = urls.map(url => url.replace(/^http:/, 'https:'));
    setImageUrls(secureUrls);
    setCurrentPreviewIndex(0);
    onImageChange(secureUrls);
    onCurrentIndexChange(0);
  };

  const handlePrevPreview = () => {
    const newIndex = currentPreviewIndex > 0 ? currentPreviewIndex - 1 : imageUrls.length - 1;
    setCurrentPreviewIndex(newIndex);
    onCurrentIndexChange(newIndex);
  };

  const handleNextPreview = () => {
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
    handleNextPreview
  };
}
