
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, ExternalLink, Download, Eye } from "lucide-react";
import { useState } from "react";

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {ads.map((ad) => (
        <Card key={ad.id} className="overflow-hidden group relative">
          <div className="aspect-video relative overflow-hidden bg-muted">
            <img
              src={ad.preview_url || ad.image_url}
              alt={ad.name}
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button size="icon" variant="outline" className="rounded-full bg-white/20 backdrop-blur-sm" onClick={() => window.open(ad.preview_url || ad.image_url, '_blank')}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full bg-white/20 backdrop-blur-sm" onClick={() => {
                const a = document.createElement('a');
                a.href = ad.preview_url || ad.image_url;
                a.download = `${ad.name.replace(/\s+/g, '-')}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}>
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
                onClick={() => setExpandedAdId(expandedAdId === ad.id ? null : ad.id)}
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
