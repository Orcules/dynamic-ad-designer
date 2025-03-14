
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";
import { AdCard } from "@/components/ads/AdCard";
import { EmptyAdsList } from "@/components/ads/EmptyAdsList";
import { LoadingAdsList } from "@/components/ads/LoadingAdsList";
import { useAdImageActions } from "@/hooks/useAdImageActions";
import { GeneratedAd } from "@/utils/imageDownload";

interface GeneratedAdsListProps {
  ads: GeneratedAd[];
  isLoading?: boolean;
  onRetryLoad?: () => void;
}

export const GeneratedAdsList = ({ ads, isLoading = false, onRetryLoad }: GeneratedAdsListProps) => {
  const [displayAds, setDisplayAds] = useState<GeneratedAd[]>([]);
  const [storageImages, setStorageImages] = useState<GeneratedAd[]>([]);
  
  const {
    loadingStates,
    failedImages,
    copiedLinks,
    initLoadingStates,
    handleImageError,
    handleCopyLink,
    handlePreviewClick,
    handleDownloadClick
  } = useAdImageActions();

  // Fetch images from storage
  useEffect(() => {
    const fetchStorageImages = async () => {
      try {
        Logger.info("Fetching all images from storage bucket");
        const { data: storageFiles, error: storageError } = await supabase.storage
          .from('ad-images')
          .list('full-ads', {
            limit: 100,
            sortBy: { column: 'created_at', order: 'desc' }
          });
          
        if (storageError) {
          Logger.error(`Storage list error: ${storageError.message}`);
          return;
        }
        
        if (storageFiles && storageFiles.length > 0) {
          const storageBasedAds = storageFiles
            .filter(file => file.name && !file.name.includes('.gitkeep'))
            .map((file, index) => {
              const { data: { publicUrl } } = supabase.storage
                .from('ad-images')
                .getPublicUrl(`full-ads/${file.name}`);
                
              let displayName = file.name;
              const nameParts = displayName.split('-');
              if (nameParts.length > 1) {
                displayName = nameParts[0];
                displayName = displayName.replace(/-/g, ' ');
                displayName = displayName.split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
              }
              
              return {
                id: `storage-${index}-${file.id || Date.now()}`,
                name: displayName || `Generated Ad ${index + 1}`,
                image_url: publicUrl,
                preview_url: publicUrl,
                platform: 'unknown',
                originalFilename: file.name
              };
            });
            
          if (storageBasedAds.length > 0) {
            Logger.info(`Retrieved ${storageBasedAds.length} ads from storage`);
            setStorageImages(storageBasedAds);
          }
        }
      } catch (err) {
        Logger.error(`Error fetching from storage: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    fetchStorageImages();
  }, []);

  // Combine ads from props and storage
  useEffect(() => {
    const allAds = [...ads];
    
    const existingUrls = new Set(ads.map(ad => ad.image_url));
    const uniqueStorageAds = storageImages.filter(ad => !existingUrls.has(ad.image_url));
    
    allAds.push(...uniqueStorageAds);
    
    Logger.info(`Processing ${allAds.length} ads for display (${ads.length} from props, ${uniqueStorageAds.length} unique from storage)`);
    
    setDisplayAds(allAds);
    initLoadingStates(allAds);
  }, [ads, storageImages]);

  if (isLoading) {
    return <LoadingAdsList />;
  }

  if (displayAds.length === 0) {
    return <EmptyAdsList onRetryLoad={onRetryLoad} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayAds.map((ad) => (
        <AdCard
          key={ad.id}
          ad={ad}
          isLoading={loadingStates[ad.id] || false}
          onImageError={handleImageError}
          onPreviewClick={handlePreviewClick}
          onDownloadClick={handleDownloadClick}
          onCopyLink={handleCopyLink}
          failedImages={failedImages}
          copiedLinks={copiedLinks}
        />
      ))}
      {onRetryLoad && (
        <div className="col-span-full flex justify-center mt-4">
          <Button variant="outline" onClick={onRetryLoad}>
            טען מודעות נוספות
          </Button>
        </div>
      )}
    </div>
  );
};
