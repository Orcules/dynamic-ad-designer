
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Logger } from "@/utils/logger";

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
  const [expandedAdId, setExpandedAdId] = useState<string | null>(null);
  const [validatedAds, setValidatedAds] = useState<GeneratedAd[]>([]);
  
  useEffect(() => {
    // Validate image URLs and create a new array with only valid images
    const validateImageUrls = async () => {
      Logger.info(`Validating ${ads.length} ads`);
      const validatedAdsList = [...ads];
      setValidatedAds(validatedAdsList);
    };
    
    validateImageUrls();
  }, [ads]);

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
    Logger.warn(`Failed to load image for ad ${ad.id}: ${ad.preview_url || ad.image_url}`);
  };

  const handlePreviewClick = (imageUrl: string) => {
    if (!imageUrl) return;
    
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
    
    try {
      // Check if it's an external URL or a local one
      const isExternalUrl = imageUrl.startsWith('http') && !imageUrl.includes(window.location.hostname);
      
      if (isExternalUrl) {
        // For external images, we'll use a different approach: download the image and serve it locally
        fetch(imageUrl)
          .then(response => response.blob())
          .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `${ad.name.replace(/\s+/g, '-')}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl); // Release resources
            Logger.info(`Downloaded image from external URL: ${imageUrl}`);
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
        Logger.info(`Downloaded image: ${imageUrl}`);
      }
    } catch (err) {
      Logger.error(`Error downloading image: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {ads.map((ad) => (
        <Card key={ad.id} className="overflow-hidden group relative">
          <div className="aspect-video relative overflow-hidden bg-muted flex items-center justify-center">
            {ad.preview_url || ad.image_url ? (
              <img
                src={ad.preview_url || ad.image_url}
                alt={ad.name}
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  handleImageError(ad);
                  // Replace with placeholder if image fails to load
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <span className="text-sm">Image not available</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button 
                size="icon" 
                variant="outline" 
                className="rounded-full bg-white/20 backdrop-blur-sm" 
                onClick={() => handlePreviewClick(ad.preview_url || ad.image_url)}
                disabled={!ad.preview_url && !ad.image_url}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                className="rounded-full bg-white/20 backdrop-blur-sm" 
                onClick={() => handleDownloadClick(ad)}
                disabled={!ad.preview_url && !ad.image_url}
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
    </div>
  );
};
