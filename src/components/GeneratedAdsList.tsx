
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
  
  useEffect(() => {
    // בדיקת תקינות של ה-URLs של התמונות
    const validateImageUrls = async () => {
      // מאתחל את מצב התמונות שנכשלו כדי למנוע בלבול עם תמונות קודמות
      setFailedImages({});
      setValidatingImages(true);
      setValidatedAds(ads);
      
      // פונקציה לבדיקת תקינות URL - כולל cache-busting
      const checkImageUrlValidity = async (url: string): Promise<boolean> => {
        if (!url || url === "undefined" || url === "null") return false;
        
        try {
          // הוספת מניעת מטמון
          const cacheBustUrl = url.includes('?') 
            ? `${url}&t=${Date.now()}` 
            : `${url}?t=${Date.now()}`;
            
          // נסיון לבדוק את התמונה באמצעות חיבור HEAD כדי לא להוריד את כל התמונה
          const response = await fetch(cacheBustUrl, { 
            method: 'HEAD', 
            cache: 'no-store',
            credentials: 'omit'
          });
          return response.ok;
        } catch (error) {
          Logger.warn(`Failed to validate image URL (${url}): ${error}`);
          return false;
        }
      };
      
      // בודק כל תמונה בנפרד
      const failedOnes: Record<string, boolean> = {};
      for (const ad of ads) {
        const imageUrl = ad.preview_url || ad.image_url;
        if (imageUrl) {
          const isValid = await checkImageUrlValidity(imageUrl);
          if (!isValid) {
            Logger.warn(`Found invalid image URL for ad ${ad.id}: ${imageUrl}`);
            failedOnes[ad.id] = true;
          }
        }
      }
      
      setFailedImages(failedOnes);
      setValidatingImages(false);
    };
    
    if (ads.length > 0) {
      validateImageUrls();
    }
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
        <p className="text-muted-foreground">לא נוצרו מודעות עדיין</p>
        <p className="text-sm text-muted-foreground mt-2">
          המודעות שתיצור יופיעו כאן
        </p>
      </div>
    );
  }

  const handleImageError = (ad: GeneratedAd) => {
    Logger.warn(`Failed to load image for ad ${ad.id}: ${ad.preview_url || ad.image_url}`);
    setFailedImages(prev => ({
      ...prev,
      [ad.id]: true
    }));
  };

  const handleRetryImage = async (ad: GeneratedAd) => {
    try {
      // ניסיון לבדוק אם התמונה זמינה עם cache-busting
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
        // אם התמונה זמינה, נסיר אותה מרשימת התמונות שנכשלו
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
      // פתיחת התמונה בחלון חדש עם cache-busting
      const cacheBustUrl = imageUrl.includes('?') 
        ? `${imageUrl}&t=${Date.now()}` 
        : `${imageUrl}?t=${Date.now()}`;
        
      const win = window.open(cacheBustUrl, '_blank');
      if (!win) {
        toast.error('Popup was blocked. Please allow popups for this site.');
      }
    } catch (error) {
      Logger.error(`Error showing preview: ${error instanceof Error ? error.message : String(error)}`);
      toast.error('Failed to open preview');
    }
  };

  const handleDownloadClick = (ad: GeneratedAd) => {
    if (!ad.preview_url && !ad.image_url) {
      toast.error('No image available to download');
      return;
    }
    
    const imageUrl = ad.preview_url || ad.image_url;
    // הוספת מניעת מטמון
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
          // יצירת אובייקט URL מקומי מה-blob שהורדנו
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = `${ad.name.replace(/\s+/g, '-')}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          // שחרור האובייקט URL כדי למנוע דליפות זיכרון
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
          
          toast.success('Image downloaded successfully');
        })
        .catch(err => {
          Logger.error(`Error downloading image: ${err instanceof Error ? err.message : String(err)}`);
          toast.error('Failed to download image');
        });
    } catch (err) {
      Logger.error(`Error initiating download: ${err instanceof Error ? err.message : String(err)}`);
      toast.error('Failed to download image');
    }
  };

  // הצגת הודעת אזהרה אם יש תמונות שנכשלו בטעינה
  const failedImagesCount = Object.keys(failedImages).length;
  
  return (
    <div>
      {validatingImages && (
        <div className="flex items-center justify-center p-4 mb-4 bg-muted/50 rounded-lg">
          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
          <p>בודק תקינות תמונות...</p>
        </div>
      )}
      
      {failedImagesCount > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>שים לב</AlertTitle>
          <AlertDescription>
            {failedImagesCount} מודעות לא נטענו כראוי בגלל בעיית תמונה. 
            אנא נסה לרענן את הדף או ליצור מודעות חדשות.
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
                    <span className="text-sm text-center">התמונה לא זמינה</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2" 
                      onClick={() => handleRetryImage(ad)}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      נסה שוב
                    </Button>
                  </div>
                ) : (
                  <img
                    src={`${ad.preview_url || ad.image_url}${(ad.preview_url || ad.image_url).includes('?') ? '&' : '?'}t=${Date.now()}`}
                    alt={ad.name}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      handleImageError(ad);
                      // שימוש בתמונת גיבוי מקומית
                      (e.target as HTMLImageElement).src = placeholderImage;
                    }}
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                  <ImageOff className="h-8 w-8 mb-2 text-muted-foreground/50" />
                  <span className="text-sm text-center">התמונה לא זמינה</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="rounded-full bg-white/20 backdrop-blur-sm" 
                  onClick={() => handlePreviewClick(ad.preview_url || ad.image_url)}
                  disabled={!ad.preview_url && !ad.image_url || failedImages[ad.id]}
                  title="צפייה בתמונה" 
                  aria-label="צפייה בתמונה"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="rounded-full bg-white/20 backdrop-blur-sm" 
                  onClick={() => handleDownloadClick(ad)}
                  disabled={!ad.preview_url && !ad.image_url || failedImages[ad.id]}
                  title="הורדת תמונה"
                  aria-label="הורדת תמונה"
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
                  title="פתיחת תמונה בחלון חדש"
                  aria-label="פתיחת תמונה בחלון חדש"
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
