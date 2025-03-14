
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Logger } from '@/utils/logger';
import { cleanImageUrl } from '@/utils/imageEffects';
import { createImagePreview } from '@/utils/imagePreview';
import { downloadImage, GeneratedAd } from '@/utils/imageDownload';

export const useAdImageActions = () => {
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [copiedLinks, setCopiedLinks] = useState<{ [key: string]: boolean }>({});

  // Set initial loading states for new ads
  const initLoadingStates = (ads: GeneratedAd[]) => {
    setLoadingStates(
      ads.reduce((acc, ad) => ({ ...acc, [ad.id]: true }), {})
    );
    
    // Automatically turn off loading after 1.5s
    const timer = setTimeout(() => {
      setLoadingStates(
        ads.reduce((acc, ad) => ({ ...acc, [ad.id]: false }), {})
      );
    }, 1500);
    
    return () => clearTimeout(timer);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, ad: GeneratedAd) => {
    Logger.warn(`Failed to load image for ad ${ad.id}: ${ad.preview_url || ad.image_url}`);
    
    setFailedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(ad.preview_url || ad.image_url);
      return newSet;
    });
    
    setLoadingStates(prev => ({ ...prev, [ad.id]: false }));
    
    if (e.currentTarget) {
      e.currentTarget.src = "/placeholder.svg";
      e.currentTarget.style.opacity = "0.7";
      e.currentTarget.style.objectFit = "contain";
    }
  };

  const handleCopyLink = async (ad: GeneratedAd) => {
    let imageUrl = ad.preview_url || ad.image_url;
    if (!imageUrl) return;
    
    imageUrl = cleanImageUrl(imageUrl);
    
    try {
      await navigator.clipboard.writeText(imageUrl);
      
      setCopiedLinks(prev => ({ ...prev, [ad.id]: true }));
      
      setTimeout(() => {
        setCopiedLinks(prev => ({ ...prev, [ad.id]: false }));
      }, 2000);
      
      toast.success("Image link copied to clipboard");
      Logger.info(`Copied image URL to clipboard: ${imageUrl.substring(0, 50)}...`);
    } catch (err) {
      toast.error("Failed to copy link");
      Logger.error(`Error copying link: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handlePreviewClick = (imageUrl: string) => {
    if (!imageUrl) return;
    createImagePreview(imageUrl);
  };

  const handleDownloadClick = (ad: GeneratedAd) => {
    downloadImage(ad);
  };

  return {
    loadingStates,
    failedImages,
    copiedLinks,
    initLoadingStates,
    handleImageError,
    handleCopyLink,
    handlePreviewClick,
    handleDownloadClick
  };
};
