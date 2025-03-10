import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Logger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedAd {
  id: string;
  name: string;
  image_url: string;
  preview_url?: string;
  platform?: string;
}

interface GeneratedAdsListProps {
  ads: GeneratedAd[];
  isLoading?: boolean;
  onRetryLoad?: () => void;
}

export const GeneratedAdsList = ({ ads, isLoading = false, onRetryLoad }: GeneratedAdsListProps) => {
  const [validatedAds, setValidatedAds] = useState<GeneratedAd[]>([]);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const validateAndLoadAds = async () => {
      Logger.info(`Validating ${ads.length} ads`);
      
      // Filter out ads without required fields
      const validAds = ads.filter(ad => 
        ad && ad.id && ad.name && (ad.image_url || ad.preview_url)
      );

      // Initialize loading states
      setLoadingStates(
        validAds.reduce((acc, ad) => ({ ...acc, [ad.id]: true }), {})
      );

      // Function to check if an image URL is valid
      const checkImageUrl = async (url: string): Promise<boolean> => {
        try {
          // First try to get the image from Supabase storage
          const { data: storageData } = await supabase.storage
            .from('ad-images')
            .download(url.split('/').pop() || '');

          if (storageData) return true;

          // If not in storage, try to load the image directly
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
          });
        } catch (error) {
          Logger.error(`Error checking image URL ${url}: ${error}`);
          return false;
        }
      };

      // Validate each ad's images
      const validatedAdsList = await Promise.all(
        validAds.map(async (ad) => {
          try {
            const imageUrl = ad.preview_url || ad.image_url;
            const isValid = await checkImageUrl(imageUrl);
            
            setLoadingStates(prev => ({ ...prev, [ad.id]: false }));
            
            if (!isValid) {
              Logger.warn(`Invalid image URL for ad ${ad.id}: ${imageUrl}`);
              return null;
            }
            
            return ad;
          } catch (error) {
            Logger.error(`Error validating ad ${ad.id}: ${error}`);
            setLoadingStates(prev => ({ ...prev, [ad.id]: false }));
            return null;
          }
        })
      );

      // Filter out null values and update state
      setValidatedAds(validatedAdsList.filter((ad): ad is GeneratedAd => ad !== null));
    };

    validateAndLoadAds();
  }, [ads]);

  const handleImageError = (ad: GeneratedAd) => {
    Logger.warn(`Failed to load image for ad ${ad.id}: ${ad.preview_url || ad.image_url}`);
  };

  const handlePreviewClick = (imageUrl: string) => {
    if (!imageUrl) return;
    
    Logger.info(`Previewing image: ${imageUrl.substring(0, 50)}...`);
    
    // Create an overlay with the image and a close button instead of opening a new window
    try {
      // Create a div element with image and close button
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
      overlay.style.display = 'flex';
      overlay.style.flexDirection = 'column';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.zIndex = '9999';
      overlay.style.padding = '20px';
      
      const img = document.createElement('img');
      img.src = imageUrl;
      img.style.maxWidth = '90%';
      img.style.maxHeight = '80%';
      img.style.objectFit = 'contain';
      img.style.border = '1px solid #333';
      img.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
      
      // Add error handling for the image
      img.onerror = () => {
        Logger.error(`Failed to load preview image: ${imageUrl}`);
        img.src = "/placeholder.svg";
        img.style.maxWidth = '300px';
        img.style.maxHeight = '300px';
      };
      
      const closeButton = document.createElement('button');
      closeButton.innerText = 'Close';
      closeButton.style.marginTop = '20px';
      closeButton.style.padding = '8px 16px';
      closeButton.style.backgroundColor = '#333';
      closeButton.style.color = 'white';
      closeButton.style.border = 'none';
      closeButton.style.borderRadius = '4px';
      closeButton.style.cursor = 'pointer';
      
      closeButton.onclick = () => {
        document.body.removeChild(overlay);
      };
      
      overlay.appendChild(img);
      overlay.appendChild(closeButton);
      
      // Close on background click
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          document.body.removeChild(overlay);
        }
      };
      
      document.body.appendChild(overlay);
      
    } catch (error) {
      Logger.error(`Error showing preview: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleDownloadClick = (ad: GeneratedAd) => {
    if (!ad.preview_url && !ad.image_url) return;
    
    const imageUrl = ad.preview_url || ad.image_url;
    Logger.info(`Attempting to download image: ${imageUrl.substring(0, 50)}...`);
    
    // Special handling for blob URLs
    if (imageUrl.startsWith('blob:')) {
      try {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `${ad.name.replace(/\s+/g, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        Logger.info(`Downloaded blob image: ${imageUrl.substring(0, 30)}...`);
        return;
      } catch (err) {
        Logger.error(`Error downloading blob image: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    
    try {
      // Check if it's an external URL or a local one
      const isExternalUrl = imageUrl.startsWith('http') && !imageUrl.includes(window.location.hostname);
      
      if (isExternalUrl) {
        // For external images, use a different approach: download the image and serve it locally
        fetch(imageUrl, { mode: 'cors', cache: 'no-store' })
          .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
            return response.blob();
          })
          .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `${ad.name.replace(/\s+/g, '-')}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl); // Release resources
            Logger.info(`Downloaded image from external URL: ${imageUrl.substring(0, 30)}...`);
          })
          .catch(error => {
            Logger.error(`Failed to download from external URL: ${error.message}`);
            // If failed, try alternative approach
            const a = document.createElement('a');
            a.href = imageUrl;
            a.download = `${ad.name.replace(/\s+/g, '-')}.png`;
            a.target = '_self'; // Important: don't open new window
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          });
      } else {
        // For local images, use the regular approach
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `${ad.name.replace(/\s+/g, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        Logger.info(`Downloaded image: ${imageUrl.substring(0, 30)}...`);
      }
    } catch (err) {
      Logger.error(`Error downloading image: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No ads created yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Ads you create will appear here
        </p>
        {onRetryLoad && (
          <Button variant="outline" className="mt-4" onClick={onRetryLoad}>
            Refresh Ads
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {validatedAds.map((ad) => (
        <Card key={ad.id} className="overflow-hidden group relative">
          <div className="aspect-video relative overflow-hidden bg-muted flex items-center justify-center">
            {loadingStates[ad.id] ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {(ad.preview_url || ad.image_url) && (
                  <img
                    src={ad.preview_url || ad.image_url}
                    alt={ad.name}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      Logger.error(`Failed to load image for ad ${ad.id}`);
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                    crossOrigin="anonymous"
                  />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="rounded-full bg-white/20 backdrop-blur-sm" 
                    onClick={() => handlePreviewClick(ad.preview_url || ad.image_url)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="rounded-full bg-white/20 backdrop-blur-sm" 
                    onClick={() => handleDownloadClick(ad)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="truncate pr-4">
                <h3 className="font-medium text-sm truncate">{ad.name}</h3>
                {ad.platform && (
                  <span className="text-xs text-muted-foreground">{ad.platform}</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => {
                  if (ad.preview_url || ad.image_url) {
                    handlePreviewClick(ad.preview_url || ad.image_url);
                  }
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {onRetryLoad && (
        <div className="col-span-full flex justify-center mt-4">
          <Button variant="outline" onClick={onRetryLoad}>
            Load More Ads
          </Button>
        </div>
      )}
    </div>
  );
};
