
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Eye, Copy, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Logger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";
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
  onRetryLoad?: () => void;
}

export const GeneratedAdsList = ({ ads, isLoading = false, onRetryLoad }: GeneratedAdsListProps) => {
  const [displayAds, setDisplayAds] = useState<GeneratedAd[]>([]);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [storageImages, setStorageImages] = useState<GeneratedAd[]>([]);
  const [copiedLinks, setCopiedLinks] = useState<{ [key: string]: boolean }>({});
  const [visibleCount, setVisibleCount] = useState(6); // Initially show only 6 ads (reduced from 10)
  const [isFetchingStorage, setIsFetchingStorage] = useState(false);
  const storageLoadedRef = useRef(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Limit fetch to once on mount with useRef to avoid duplicate fetches
  useEffect(() => {
    // Only fetch storage images if we haven't already
    if (!storageLoadedRef.current && !isFetchingStorage) {
      fetchStorageImages();
    }
    
    return () => {
      // Clean up any previews when component unmounts
      if (overlayRef.current && document.body.contains(overlayRef.current)) {
        document.body.removeChild(overlayRef.current);
        overlayRef.current = null;
      }
    };
  }, []);

  // Load images from storage bucket but limit to 10 for better initial performance
  const fetchStorageImages = async () => {
    if (isFetchingStorage || storageLoadedRef.current) return;
    
    try {
      setIsFetchingStorage(true);
      Logger.info("Fetching images from storage bucket (limited to 10)");
      const { data: storageFiles, error: storageError } = await supabase.storage
        .from('ad-images')
        .list('full-ads', {
          limit: 10, // Reduced from 20 to 10
          sortBy: { column: 'created_at', order: 'desc' }
        });
        
      if (storageError) {
        Logger.error(`Storage list error: ${storageError.message}`);
        return;
      }
      
      if (storageFiles && storageFiles.length > 0) {
        // Convert storage files to ad objects
        const storageBasedAds = storageFiles
          .filter(file => file.name && !file.name.includes('.gitkeep'))
          .map((file, index) => {
            const { data: { publicUrl } } = supabase.storage
              .from('ad-images')
              .getPublicUrl(`full-ads/${file.name}`);
              
            // Try to extract a readable name from the filename
            let displayName = file.name;
            // Extract the ad name (should be the first part before the date)
            const nameParts = displayName.split('-');
            if (nameParts.length > 1) {
              // First part is the ad name
              displayName = nameParts[0];
              // Capitalize and format
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
              originalFilename: file.name // Store the original filename for downloads
            };
          });
          
        if (storageBasedAds.length > 0) {
          Logger.info(`Retrieved ${storageBasedAds.length} ads from storage`);
          setStorageImages(storageBasedAds);
          storageLoadedRef.current = true;
        }
      }
    } catch (err) {
      Logger.error(`Error fetching from storage: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsFetchingStorage(false);
    }
  };

  // Process ads with useCallback for better performance
  const processAds = useCallback(() => {
    // Combine ads from props with ads from storage, but limit the total
    const allAds = [...ads];
    
    // Add storage images that aren't already in ads (by URL)
    const existingUrls = new Set(ads.map(ad => ad.image_url));
    const uniqueStorageAds = storageImages
      .filter(ad => !existingUrls.has(ad.image_url))
      .slice(0, 10); // Limit to 10 storage ads max (reduced from 20)
    
    allAds.push(...uniqueStorageAds);
    
    Logger.info(`Processing ${allAds.length} ads for display (${ads.length} from props, ${uniqueStorageAds.length} unique from storage)`);
    
    // Initialize loading states for all ads
    setLoadingStates(
      allAds.reduce((acc, ad) => ({ ...acc, [ad.id]: true }), {})
    );
    
    // Set display ads with minimal validation but limit the total number
    setDisplayAds(allAds);
    
    // Set all images as loaded after a delay
    const timer = setTimeout(() => {
      setLoadingStates(
        allAds.reduce((acc, ad) => ({ ...acc, [ad.id]: false }), {})
      );
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [ads, storageImages]);

  // Update display ads when source ads or storage images change
  useEffect(() => {
    processAds();
  }, [ads, storageImages, processAds]);

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

  // Function to copy image URL to clipboard
  const handleCopyLink = async (ad: GeneratedAd) => {
    const imageUrl = ad.preview_url || ad.image_url;
    if (!imageUrl) return;
    
    try {
      await navigator.clipboard.writeText(imageUrl);
      
      // Set copied state for this specific ad
      setCopiedLinks(prev => ({ ...prev, [ad.id]: true }));
      
      // Reset copied state after 2 seconds
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

  // Load more items
  const loadMoreItems = () => {
    setVisibleCount(prev => prev + 6); // Load 6 more ads at a time (reduced from 10)
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

  if (displayAds.length === 0) {
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

  // Only display a limited number of ads
  const visibleAds = displayAds.slice(0, visibleCount);
  const hasMoreToLoad = visibleCount < displayAds.length;

  const handlePreviewClick = (imageUrl: string) => {
    if (!imageUrl) return;
    
    Logger.info(`Previewing image: ${imageUrl.substring(0, 50)}...`);
    
    try {
      // Clean up any existing overlay
      if (overlayRef.current && document.body.contains(overlayRef.current)) {
        document.body.removeChild(overlayRef.current);
      }
      
      // Create a new overlay
      const overlay = document.createElement('div');
      overlayRef.current = overlay;
      
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
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
          overlayRef.current = null;
        }
      };
      
      overlay.appendChild(img);
      overlay.appendChild(closeButton);
      
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
            overlayRef.current = null;
          }
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
    
    // Determine the filename to use for download
    let filename = 'ad.png';
    if ((ad as any).originalFilename) {
      // Use the original filename from storage if available
      filename = (ad as any).originalFilename;
    } else if (ad.name) {
      // Extract filename from URL if possible
      const urlParts = imageUrl.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      
      if (lastPart && lastPart.includes('.')) {
        // URL contains a filename with extension
        filename = lastPart;
      } else {
        // Use ad name with .png extension
        filename = `${ad.name.replace(/\s+/g, '-')}.png`;
      }
    }
    
    if (imageUrl.startsWith('blob:')) {
      try {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        Logger.info(`Downloaded blob image as: ${filename}`);
        return;
      } catch (err) {
        Logger.error(`Error downloading blob image: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    
    try {
      const isExternalUrl = imageUrl.startsWith('http') && !imageUrl.includes(window.location.hostname);
      
      if (isExternalUrl) {
        fetch(imageUrl, { mode: 'cors', cache: 'no-store' })
          .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
            return response.blob();
          })
          .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
            Logger.info(`Downloaded image from external URL as: ${filename}`);
          })
          .catch(error => {
            Logger.error(`Failed to download from external URL: ${error.message}`);
            const a = document.createElement('a');
            a.href = imageUrl;
            a.download = filename;
            a.target = '_self';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          });
      } else {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        Logger.info(`Downloaded image as: ${filename}`);
      }
    } catch (err) {
      Logger.error(`Error downloading image: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleAds.map((ad) => (
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
                      src={failedImages.has(ad.preview_url || ad.image_url) ? "/placeholder.svg" : (ad.preview_url || ad.image_url)}
                      alt={ad.name}
                      className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                      onError={(e) => handleImageError(e, ad)}
                      crossOrigin="anonymous"
                      loading="lazy"
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
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="rounded-full bg-white/20 backdrop-blur-sm" 
                      onClick={() => handleCopyLink(ad)}
                    >
                      {copiedLinks[ad.id] ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
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
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => handleCopyLink(ad)}
                    title="Copy link to clipboard"
                  >
                    {copiedLinks[ad.id] ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => {
                      if (ad.preview_url || ad.image_url) {
                        handlePreviewClick(ad.preview_url || ad.image_url);
                      }
                    }}
                    title="Preview image"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {hasMoreToLoad && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={loadMoreItems}>
            Load More Ads ({visibleCount} of {displayAds.length})
          </Button>
        </div>
      )}
      
      {!isFetchingStorage && displayAds.length < 20 && !storageLoadedRef.current && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={fetchStorageImages}>
            Load More from Storage
          </Button>
        </div>
      )}
      
      {onRetryLoad && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={onRetryLoad}>
            Refresh Ads
          </Button>
        </div>
      )}
    </div>
  );
};
