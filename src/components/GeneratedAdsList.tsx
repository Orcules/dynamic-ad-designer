
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Eye, ImageOff } from "lucide-react";
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
  const placeholderImage = "/placeholder.svg"; // מוגדר כברירת מחדל
  
  useEffect(() => {
    // בדיקת תקינות של ה-URLs של התמונות
    const validateImageUrls = async () => {
      // מאתחל את מצב התמונות שנכשלו כדי למנוע בלבול עם תמונות קודמות
      setFailedImages({});
      setValidatedAds(ads);
      
      // פונקציה לבדיקת תקינות URL
      const checkImageUrlValidity = async (url: string): Promise<boolean> => {
        if (!url || url === "undefined" || url === "null") return false;
        
        try {
          // נסיון לבדוק את התמונה באמצעות חיבור HEAD כדי לא להוריד את כל התמונה
          const response = await fetch(url, { method: 'HEAD', cache: 'no-store' });
          return response.ok;
        } catch (error) {
          Logger.warn(`Failed to validate image URL (${url}): ${error}`);
          return false;
        }
      };
      
      // בודק כל תמונה בנפרד
      for (const ad of ads) {
        const imageUrl = ad.preview_url || ad.image_url;
        if (imageUrl) {
          const isValid = await checkImageUrlValidity(imageUrl);
          if (!isValid) {
            Logger.warn(`Found invalid image URL for ad ${ad.id}: ${imageUrl}`);
            setFailedImages(prev => ({
              ...prev,
              [ad.id]: true
            }));
          }
        }
      }
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

  const handlePreviewClick = (imageUrl: string) => {
    if (!imageUrl) {
      toast.error('No preview available');
      return;
    }
    
    try {
      // פתיחת התמונה בחלון חדש באופן פשוט יותר
      const win = window.open();
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>Image Preview</title>
              <style>
                body { margin: 0; padding: 20px; background: #222; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                img { max-width: 100%; max-height: 90vh; object-fit: contain; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
                .error { color: white; font-family: sans-serif; text-align: center; }
              </style>
            </head>
            <body>
              <img src="${imageUrl}" onerror="document.body.innerHTML = '<div class=\\'error\\'>Failed to load image</div>'" />
            </body>
          </html>
        `);
        win.document.close();
      } else {
        // אם נחסם פתיחת חלון חדש, נפתח באותו חלון
        window.location.href = imageUrl;
      }
    } catch (error) {
      Logger.error(`Error showing preview: ${error instanceof Error ? error.message : String(error)}`);
      toast.error('Failed to open preview');
      
      // גיבוי - פתיחת התמונה בלשונית חדשה
      window.open(imageUrl, '_blank');
    }
  };

  const handleDownloadClick = (ad: GeneratedAd) => {
    if (!ad.preview_url && !ad.image_url) {
      toast.error('No image available to download');
      return;
    }
    
    const imageUrl = ad.preview_url || ad.image_url;
    
    try {
      // פתרון פשוט ואמין להורדת תמונות
      fetch(imageUrl)
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
          
          // שיטת גיבוי ישירה
          const a = document.createElement('a');
          a.href = imageUrl;
          a.download = `${ad.name.replace(/\s+/g, '-')}.png`;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
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
      {failedImagesCount > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>שים לב</AlertTitle>
          <AlertDescription>
            {failedImagesCount} מודעות לא נטענו כראוי בגלל בעיית תמונה. נסה לרענן את הדף או ליצור מודעות חדשות.
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
                  </div>
                ) : (
                  <img
                    src={ad.preview_url || ad.image_url}
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
