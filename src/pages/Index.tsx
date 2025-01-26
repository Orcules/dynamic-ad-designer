import { useState, useEffect } from "react";
import AdEditor from "@/components/AdEditor";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const fetchGeneratedAds = async () => {
  const { data, error } = await supabase
    .from("generated_ads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

const Index = () => {
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
      queryClient.invalidateQueries({ queryKey: ["generated-ads"] });
      
      const { data: latestAds } = await supabase
        .from("generated_ads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);
      
      const latestAd = latestAds?.[0];
      
      if (latestAd?.image_url) {
        toast.success("המודעה נוצרה בהצלחה", {
          action: {
            label: "צפה במודעה",
            onClick: () => window.open(latestAd.image_url, '_blank')
          },
        });
      } else {
        toast.success("המודעה נוצרה בהצלחה");
      }
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

        <div className="w-full">
          <AdEditor template={{ id: "default", title: "", dimensions: "", imageUrl: "", description: "" }} onAdGenerated={handleAdGenerated} />
        </div>

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