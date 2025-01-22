import { useState, useEffect } from "react";
import { AdTemplateCard } from "@/components/AdTemplateCard";
import AdEditor from "@/components/AdEditor";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const templates = [
  {
    id: "elearning",
    title: "מודעת קורס דיגיטלי",
    dimensions: "1200 x 628",
    imageUrl: "/lovable-uploads/b700e3ee-5602-402a-9a40-47c6ee76cea0.png",
    description: "מודעה בסגנון אנימה עם רקע ירקרק ואלמנטים יפניים",
  },
  {
    id: "business",
    title: "מודעת עסקים",
    dimensions: "1000 x 600",
    imageUrl: "/lovable-uploads/cc9dde94-1e79-43e0-9124-038f8676f0d3.png",
    description: "מודעה בסגנון איור עם רקע צהוב ואלמנטים עסקיים",
  },
  {
    id: "fitness",
    title: "מודעת כושר",
    dimensions: "1080 x 1080",
    imageUrl: "/lovable-uploads/5134090b-0112-4dd0-984d-a38015143104.png",
    description: "מודעה בסגנון מינימליסטי עם רקע כתום וכפתורי CTA",
  },
  {
    id: "product",
    title: "מודעת מוצר",
    dimensions: "1080 x 1080",
    imageUrl: "/lovable-uploads/07cbb6aa-223f-4a55-b5ae-c6378e45dff0.png",
    description: "מודעת מוצר עם תמונה ומסר פשוט",
  },
  {
    id: "service",
    title: "מודעת שירות",
    dimensions: "1200 x 628",
    imageUrl: "/lovable-uploads/55761d47-e2d4-4681-986a-4f47b6f275a2.png",
    description: "מודעת שירות עם תמונה אווירתית",
  },
  {
    id: "launch",
    title: "מודעת השקה",
    dimensions: "1080 x 1080",
    imageUrl: "/lovable-uploads/f4d6be66-e9f9-47e4-b18b-93c72843d4c3.png",
    description: "מודעת השקת מוצר בסגנון מינימליסטי",
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
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: generatedAds, isLoading } = useQuery({
    queryKey: ["generated-ads"],
    queryFn: fetchGeneratedAds,
  });

  useEffect(() => {
    const channel = supabase
      .channel("public:generated_ads")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "generated_ads",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["generated-ads"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleAdGenerated = async (adData: any) => {
    try {
      const { error } = await supabase.from("generated_ads").insert([adData]);
      if (error) throw error;
      toast.success("המודעה נוצרה בהצלחה");
      setSelectedTemplate(null);
    } catch (error) {
      console.error("Error generating ad:", error);
      toast.error("אירעה שגיאה ביצירת המודעה");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-right">יוצר המודעות</h1>
          <p className="text-muted-foreground text-right">צור מודעות מרהיבות למגוון פלטפורמות</p>
        </div>

        {!selectedTemplate ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <AdTemplateCard
                key={template.id}
                title={template.title}
                dimensions={template.dimensions}
                imageUrl={template.imageUrl}
                description={template.description}
                onClick={() => setSelectedTemplate(template)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AdEditor template={selectedTemplate} onAdGenerated={handleAdGenerated} />
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-right">תצוגה מקדימה</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="w-full bg-muted rounded-lg overflow-hidden"
                  style={{
                    aspectRatio:
                      selectedTemplate.id === "story" ? "9/16" : "16/9",
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    תצוגה מקדימה תופיע כאן
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-right">מודעות שנוצרו</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">שם</TableHead>
                  <TableHead className="text-right">מידות</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right">נוצר ב</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      טוען...
                    </TableCell>
                  </TableRow>
                ) : (
                  generatedAds?.map((ad) => (
                    <TableRow
                      key={ad.id}
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => setSelectedAd(ad)}
                    >
                      <TableCell className="text-right">{ad.name}</TableCell>
                      <TableCell className="text-right">
                        {ad.width} x {ad.height} px
                      </TableCell>
                      <TableCell className="text-right">
                        {ad.status === "pending" ? "בתהליך יצירה" : ad.status}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Date(ad.created_at!).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedAd} onOpenChange={() => setSelectedAd(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-right">תצוגה מקדימה של המודעה</DialogTitle>
          </DialogHeader>
          {selectedAd && (
            <div
              className="w-full relative rounded-lg overflow-hidden"
              style={{ aspectRatio: "16/9" }}
            >
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
