
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Eye, ImageOff, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Logger } from "@/utils/logger";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

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
}

export const GeneratedAdsList = ({ ads, isLoading = false }: GeneratedAdsListProps) => {
  const [validatedAds, setValidatedAds] = useState<GeneratedAd[]>([]);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [validatingImages, setValidatingImages] = useState(false);
  const placeholderImage = "/placeholder.svg";
  
  // Constant to manage prevention of log errors
  const maxLogAttempts = 3;
  const [logAttempts, setLogAttempts] = useState(0);
  
  useEffect(() => {
    // Validate image URLs
    const validateImageUrls = async () => {
      // Initialize failed images state
      setFailedImages({});
      setValidatingImages(true);
      setValidatedAds(ads);
      
      // Function to check URL validity - including cache-busting
      const checkImageUrlValidity = async (url: string): Promise<boolean> => {
        if (!url || url === "undefined" || url === "null") return false;
        
        try {
          // Add cache busting
          const cacheBustUrl = url.includes('?') 
            ? `${url}&t=${Date.now()}` 
            : `${url}?t=${Date.now()}`;
            
          // Try to check the image with a HEAD connection
          const response = await fetch(cacheBustUrl, { 
            method: 'HEAD', 
            cache: 'no-store',
            credentials: 'omit'
          });
          return response.ok;
        } catch (error) {
          // Prevent too many logs
          if (logAttempts < maxLogAttempts) {
            try {
              setLogAttempts(prev => prev + 1);
              console.warn(`Failed to validate image URL (${url}):`, error);
            } catch (logError) {
              console.warn('Failed to log warning - storage might be full');
            }
          }
          return false;
        }
      };
      
      // Check each image individually
      const failedOnes: Record<string, boolean> = {};
      let validatedCount = 0;
      let failedCount = 0;
      
      for (const ad of ads) {
        const imageUrl = ad.preview_url || ad.image_url;
        if (imageUrl) {
          const isValid = await checkImageUrlValidity(imageUrl);
          if (!isValid) {
            failedOnes[ad.id] = true;
            failedCount++;
            
            // Only try to log if we haven't reached max attempts
            if (logAttempts < maxLogAttempts) {
              try {
                console.warn(`Found invalid image URL for ad ${ad.id}`);
              } catch (logError) {
                // If failed to log, stop trying
                setLogAttempts(maxLogAttempts);
              }
            }
          } else {
            validatedCount++;
          }
        }
      }
      
      // Console summary instead of trying to log each image separately
      try {
        console.info(`Image validation complete: ${validatedCount} valid, ${failedCount} failed`);
      } catch (logError) {
        console.warn('Failed to log summary');
      }
      
      setFailedImages(failedOnes);
      setValidatingImages(false);
    };
    
    if (ads.length > 0) {
      validateImageUrls();
    }
  }, [ads, logAttempts, maxLogAttempts]);

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
      </div>
    );
  }

  const handleImageError = (ad: GeneratedAd) => {
    try {
      if (logAttempts < maxLogAttempts) {
        console.warn(`Failed to load image for ad ${ad.id}`);
        setLogAttempts(prev => prev + 1);
      }
    } catch (error) {
      // Ignore logging errors
      console.warn('Failed to log image error');
    }
    
    setFailedImages(prev => ({
      ...prev,
      [ad.id]: true
    }));
  };

  const handleRetryImage = async (ad: GeneratedAd) => {
    try {
      // Try to check if the image is available with cache-busting
      const imageUrl = ad.preview_url || ad.image_url;
      const cacheBustUrl = imageUrl.includes('?') 
        ? `${imageUrl}&t=${Date.now()}` 
        : `${imageUrl}?t=${Date.now()}`;
        
      const response = await fetch(cacheBustUrl, { 
        method: 'HEAD', 
        cache: 'no-store',
        credentials: 'omit'
      });
      
      if (response.ok) {
        // If the image is available, remove it from the failed images list
        setFailedImages(prev => {
          const newFailedImages = { ...prev };
          delete newFailedImages[ad.id];
          return newFailedImages;
        });
        toast.success('Image loaded successfully');
      } else {
        toast.error('Image is still unavailable');
      }
    } catch (error) {
      toast.error('Failed to load image');
    }
  };

  const handlePreviewClick = (imageUrl: string) => {
    if (!imageUrl) {
      toast.error('No preview available');
      return;
    }
    
    try {
      // Open the image in a new window with cache-busting
      const cacheBustUrl = imageUrl.includes('?') 
        ? `${imageUrl}&t=${Date.now()}` 
        : `${imageUrl}?t=${Date.now()}`;
        
      const win = window.open(cacheBustUrl, '_blank');
      if (!win) {
        toast.error('Popup was blocked. Please allow popups for this site.');
      }
    } catch (error) {
      toast.error('Failed to open preview');
    }
  };

  const handleDownloadClick = (ad: GeneratedAd) => {
    if (!ad.preview_url && !ad.image_url) {
      toast.error('No image available to download');
      return;
    }
    
    const imageUrl = ad.preview_url || ad.image_url;
    // Add cache busting
    const cacheBustUrl = imageUrl.includes('?') 
      ? `${imageUrl}&t=${Date.now()}` 
      : `${imageUrl}?t=${Date.now()}`;
    
    try {
      fetch(cacheBustUrl, {
        cache: 'no-store',
        credentials: 'omit'
      })
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return response.blob();
        })
        .then(blob => {
          // Create a local URL object from the downloaded blob
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = `${ad.name.replace(/\s+/g, '-')}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          // Release the URL object to prevent memory leaks
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
          
          toast.success('Image downloaded successfully');
        })
        .catch(err => {
          console.error('Error downloading image:', err);
          toast.error('Failed to download image');
        });
    } catch (err) {
      console.error('Error initiating download:', err);
      toast.error('Failed to download image');
    }
  };

  // Show warning alert if there are failed images
  const failedImagesCount = Object.keys(failedImages).length;
  
  return (
    <div>
      {validatingImages && (
        <div className="flex items-center justify-center p-4 mb-4 bg-muted/50 rounded-lg">
          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
          <p>Validating images...</p>
        </div>
      )}
      
      {failedImagesCount > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Attention</AlertTitle>
          <AlertDescription>
            {failedImagesCount} ads failed to load properly due to image issues. 
            Please try refreshing the page or create new ads.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.map((ad) => (
          <Card key={ad.id} className="overflow-hidden group relative">
            <div className="aspect-video relative overflow-hidden bg-muted flex items-center justify-center">
              {ad.preview_url || ad.image_url ? (
                failedImages[ad.id] ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                    <ImageOff className="h-8 w-8 mb-2 text-muted-foreground/50" />
                    <span className="text-sm text-center">Image not available</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2" 
                      onClick={() => handleRetryImage(ad)}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Try again
                    </Button>
                  </div>
                ) : (
                  <img
                    src={`${ad.preview_url || ad.image_url}${(ad.preview_url || ad.image_url).includes('?') ? '&' : '?'}t=${Date.now()}`}
                    alt={ad.name}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      handleImageError(ad);
                      // Use local fallback image
                      (e.target as HTMLImageElement).src = placeholderImage;
                    }}
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                  <ImageOff className="h-8 w-8 mb-2 text-muted-foreground/50" />
                  <span className="text-sm text-center">Image not available</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="rounded-full bg-white/20 backdrop-blur-sm" 
                  onClick={() => handlePreviewClick(ad.preview_url || ad.image_url)}
                  disabled={!ad.preview_url && !ad.image_url || failedImages[ad.id]}
                  title="View image" 
                  aria-label="View image"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="rounded-full bg-white/20 backdrop-blur-sm" 
                  onClick={() => handleDownloadClick(ad)}
                  disabled={!ad.preview_url && !ad.image_url || failedImages[ad.id]}
                  title="Download image"
                  aria-label="Download image"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
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
                  className="h-8 w-8"
                  onClick={() => {
                    if ((ad.preview_url || ad.image_url) && !failedImages[ad.id]) {
                      handlePreviewClick(ad.preview_url || ad.image_url);
                    }
                  }}
                  disabled={failedImages[ad.id]}
                  title="Open image in new window"
                  aria-label="Open image in new window"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
