
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Eye, Copy, CheckCircle2 } from "lucide-react";
import { cleanImageUrl } from "@/utils/imageEffects";

interface GeneratedAd {
  id: string;
  name: string;
  image_url: string;
  preview_url?: string;
  platform?: string;
}

interface AdCardProps {
  ad: GeneratedAd;
  isLoading: boolean;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>, ad: GeneratedAd) => void;
  onPreviewClick: (imageUrl: string) => void;
  onDownloadClick: (ad: GeneratedAd) => void;
  onCopyLink: (ad: GeneratedAd) => void;
  failedImages: Set<string>;
  copiedLinks: { [key: string]: boolean };
}

export const AdCard: React.FC<AdCardProps> = ({
  ad,
  isLoading,
  onImageError,
  onPreviewClick,
  onDownloadClick,
  onCopyLink,
  failedImages,
  copiedLinks,
}) => {
  return (
    <Card key={ad.id} className="overflow-hidden group relative">
      <div className="aspect-video relative overflow-hidden bg-muted flex items-center justify-center">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {(ad.preview_url || ad.image_url) && (
              <img
                src={failedImages.has(ad.preview_url || ad.image_url) ? 
                      "/placeholder.svg" : 
                      cleanImageUrl(ad.preview_url || ad.image_url)}
                alt={ad.name}
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                onError={(e) => onImageError(e, ad)}
                crossOrigin="anonymous"
              />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button 
                size="icon" 
                variant="outline" 
                className="rounded-full bg-white/20 backdrop-blur-sm" 
                onClick={() => onPreviewClick(ad.preview_url || ad.image_url)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                className="rounded-full bg-white/20 backdrop-blur-sm" 
                onClick={() => onDownloadClick(ad)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                className="rounded-full bg-white/20 backdrop-blur-sm" 
                onClick={() => onCopyLink(ad)}
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
            <h3 className="font-medium text-sm truncate" dir="auto">{ad.name}</h3>
            {ad.platform && (
              <span className="text-xs text-muted-foreground">{ad.platform}</span>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => onCopyLink(ad)}
              title="העתק קישור"
            >
              {copiedLinks[ad.id] ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => {
                if (ad.preview_url || ad.image_url) {
                  onPreviewClick(ad.preview_url || ad.image_url);
                }
              }}
              title="תצוגה מקדימה"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
