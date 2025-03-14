
import { useState, useRef } from "react";
import { Logger } from "@/utils/logger";

interface UseImageLoaderProps {
  onImageChange?: (urls: string[]) => void;
}

export function useImageLoader({ onImageChange }: UseImageLoaderProps = {}) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const imageCacheRef = useRef<Map<string, boolean>>(new Map());
  const preloadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const preloadImage = (url: string) => {
    if (imageCacheRef.current.has(url) || preloadedImagesRef.current.has(url)) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCacheRef.current.set(url, true);
      preloadedImagesRef.current.set(url, img);
      Logger.info(`Preloaded image: ${url.substring(0, 50)}...`);
    };
    img.src = url;
  };

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
      
      const urls = files.map(file => {
        const url = URL.createObjectURL(file);
        preloadImage(url);
        return url;
      });
      
      setImageUrls(prevUrls => {
        const newUrls = [...prevUrls, ...urls];
        if (onImageChange) {
          setTimeout(() => onImageChange(newUrls), 0);
        }
        return newUrls;
      });
    }
  };

  const handleImageUrlsChange = (urls: string[]) => {
    try {
      const validUrls = urls.filter(url => url && url.trim() !== '' && url !== 'undefined');
      
      if (validUrls.length === 0) {
        Logger.warn('No valid image URLs provided');
        return;
      }
      
      const secureUrls = validUrls.map(url => {
        if (url.startsWith('http:') && !url.includes('localhost')) {
          return url.replace(/^http:/, 'https:');
        }
        return url;
      });
      
      // Preload all images before setting them
      Promise.all(secureUrls.map(url => {
        preloadImage(url);
        return new Promise<void>((resolve) => {
          setTimeout(resolve, 50);
        });
      })).then(() => {
        Logger.info("All images preloaded successfully");
      });
      
      setImageUrls(secureUrls);
      if (onImageChange) {
        onImageChange(secureUrls);
      }
    } catch (error) {
      Logger.error(`Error in handleImageUrlsChange: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const getPreloadedImage = (url: string): HTMLImageElement | null => {
    const img = preloadedImagesRef.current.get(url) || null;
    if (!img && url) {
      Logger.info(`No preloaded image found for ${url.substring(0, 30)}...`);
    }
    return img;
  };

  return {
    selectedImages,
    imageUrls,
    handleImageChange,
    handleImageUrlsChange,
    preloadImage,
    getPreloadedImage,
    setImageUrls
  };
}
