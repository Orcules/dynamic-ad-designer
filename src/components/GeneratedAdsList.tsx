
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Logger } from "@/utils/logger";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner"; // חשוב: הוספת ייבוא של toast מ-sonner

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
  
  useEffect(() => {
    // בדיקת תקינות של ה-URLs של התמונות ויצירת מערך חדש עם תמונות תקינות בלבד
    const validateImageUrls = async () => {
      const validatedAdsList = [...ads];
      
      // מאתחל את מצב התמונות שנכשלו כדי למנוע בלבול עם תמונות קודמות
      setFailedImages({});
      
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
    if (!imageUrl) return;
    
    try {
      // נפתח את התמונה בחלון חדש במקום להשתמש בקוד מורכב יותר
      window.open(imageUrl, '_blank');
    } catch (error) {
      Logger.error(`Error showing preview: ${error instanceof Error ? error.message : String(error)}`);
      toast.error('Failed to open preview');
    }
  };

  const handleDownloadClick = (ad: GeneratedAd) => {
    if (!ad.preview_url && !ad.image_url) return;
    
    const imageUrl = ad.preview_url || ad.image_url;
    
    try {
      // פתרון פשוט יותר להורדת התמונה
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `${ad.name.replace(/\s+/g, '-')}.png`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      Logger.info(`Initiated download for image: ${imageUrl}`);
    } catch (err) {
      Logger.error(`Error downloading image: ${err instanceof Error ? err.message : String(err)}`);
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
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <span className="text-sm">התמונה לא זמינה</span>
                  </div>
                ) : (
                  <img
                    src={ad.preview_url || ad.image_url}
                    alt={ad.name}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      handleImageError(ad);
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                )
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
                  disabled={!ad.preview_url && !ad.image_url || failedImages[ad.id]}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="rounded-full bg-white/20 backdrop-blur-sm" 
                  onClick={() => handleDownloadClick(ad)}
                  disabled={!ad.preview_url && !ad.image_url || failedImages[ad.id]}
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
