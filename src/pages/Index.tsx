import { useState, useEffect } from "react";
import AdEditor from "@/components/AdEditor";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

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
        toast.success("Ad created successfully", {
          action: {
            label: "View Ad",
            onClick: () => window.open(latestAd.image_url, '_blank')
          },
        });
      } else {
        toast.success("Ad created successfully");
      }
    } catch (error) {
      console.error("Error generating ad:", error);
      toast.error("Error creating ad");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10 text-foreground p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Dynamic Ad Designer
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Create stunning ads for multiple platforms with ease
          </p>
        </div>

        <div className="w-full backdrop-blur-sm bg-background/50 rounded-xl shadow-xl p-6">
          <AdEditor 
            template={{ 
              id: "default", 
              title: "", 
              dimensions: "", 
              imageUrl: "", 
              description: "" 
            }} 
            onAdGenerated={handleAdGenerated} 
          />
        </div>

        <Card className="backdrop-blur-sm bg-background/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Generated Ads</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (
                  generatedAds?.map((ad) => (
                    <TableRow
                      key={ad.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedAd(ad)}
                    >
                      <TableCell>{ad.name}</TableCell>
                      <TableCell>
                        {ad.width} x {ad.height} px
                      </TableCell>
                      <TableCell>
                        {ad.status === "pending" ? "Creating..." : ad.status}
                      </TableCell>
                      <TableCell>
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
            <DialogTitle>Ad Preview</DialogTitle>
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
                  <p className="text-muted-foreground">Creating ad...</p>
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