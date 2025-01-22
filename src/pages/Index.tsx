import { useState, useEffect } from "react";
import { AdTemplateCard } from "@/components/AdTemplateCard";
import { AdEditor } from "@/components/AdEditor";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const templates = [
  {
    id: "facebook",
    title: "Facebook Ad",
    dimensions: "1200 x 628 px",
  },
  {
    id: "taboola",
    title: "Taboola Ad",
    dimensions: "1000 x 600 px",
  },
  {
    id: "google",
    title: "Google Display Ad",
    dimensions: "300 x 250 px",
  },
  {
    id: "story",
    title: "Story Ad",
    dimensions: "1080 x 1920 px",
  },
];

const fetchGeneratedAds = async () => {
  const { data, error } = await supabase
    .from("generated_ads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

const Index = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: generatedAds, isLoading } = useQuery({
    queryKey: ["generated-ads"],
    queryFn: fetchGeneratedAds,
  });

  useEffect(() => {
    const channel = supabase
      .channel('public:generated_ads')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generated_ads'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['generated-ads'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleAdGenerated = (adData: any) => {
    setPreviewData(adData);
  };

  const handleAdClick = (ad: any) => {
    setSelectedAd(ad);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Ad Creator</h1>
          <p className="text-muted-foreground">Create beautiful ads for multiple platforms</p>
        </div>

        {!selectedTemplate ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template) => (
              <AdTemplateCard
                key={template.id}
                title={template.title}
                dimensions={template.dimensions}
                onClick={() => setSelectedTemplate(template)}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AdEditor template={selectedTemplate} onAdGenerated={handleAdGenerated} />
              <div className="bg-card rounded-lg p-6 animate-fade-in">
                <h3 className="text-xl font-bold mb-4">Preview</h3>
                <div
                  className="w-full bg-muted rounded-lg overflow-hidden"
                  style={{ aspectRatio: selectedTemplate.id === "story" ? "9/16" : "16/9" }}
                >
                  {previewData && (
                    <div className="w-full h-full relative">
                      {previewData.image_url && (
                        <img
                          src={previewData.image_url}
                          alt="Ad preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                      {previewData.headline && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50">
                          <h4 className="text-white text-lg font-bold">{previewData.headline}</h4>
                          {previewData.cta_text && (
                            <button className="mt-2 px-4 py-2 bg-primary text-white rounded">
                              {previewData.cta_text}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>מודעות שנוצרו</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>שם</TableHead>
                      <TableHead>מידות</TableHead>
                      <TableHead>סטטוס</TableHead>
                      <TableHead>נוצר ב</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">טוען...</TableCell>
                      </TableRow>
                    ) : generatedAds?.map((ad) => (
                      <TableRow 
                        key={ad.id} 
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => handleAdClick(ad)}
                      >
                        <TableCell>{ad.name}</TableCell>
                        <TableCell>{ad.width} x {ad.height} px</TableCell>
                        <TableCell>{ad.status === 'pending' ? 'בתהליך יצירה' : ad.status}</TableCell>
                        <TableCell>{new Date(ad.created_at!).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Dialog open={!!selectedAd} onOpenChange={() => setSelectedAd(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-right">תצוגה מקדימה של המודעה</DialogTitle>
          </DialogHeader>
          {selectedAd && (
            <div className="w-full relative rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
              {selectedAd.image_url ? (
                <img
                  src={selectedAd.image_url}
                  alt="Ad preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <p className="text-muted-foreground">המודעה בתהליך יצירה...</p>
                </div>
              )}
              {selectedAd.headline && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50">
                  <h4 className="text-white text-lg font-bold">{selectedAd.headline}</h4>
                  {selectedAd.cta_text && (
                    <button className="mt-2 px-4 py-2 bg-primary text-white rounded">
                      {selectedAd.cta_text}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;