
import { useState, useEffect } from "react";
import AdEditor from "@/components/AdEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

interface GeneratedAd {
  id: string;
  name: string;
  image_url: string;
}

const Index = () => {
  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    fetchGeneratedAds();
  }, []);

  const fetchGeneratedAds = async () => {
    console.log("Starting to fetch generated ads...");
    const { data, error } = await supabase
      .from('generated_ads')
      .select('id, name, image_url')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching ads:", error);
      toast.error("Error loading ads");
      return;
    }

    if (data) {
      console.log("Successfully fetched ads. Count:", data.length);
      setGeneratedAds(data);
    } else {
      console.log("No ads data returned");
    }
  };

  const handleAdGenerated = async (adData: any) => {
    console.log("Ad generated:", adData);
    await fetchGeneratedAds();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10 text-foreground p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full animate-fade-in">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Dynamic Ad Designer
            </h1>
          </div>
          <p className="text-muted-foreground text-lg animate-fade-in">
            Create stunning ads for multiple platforms with ease
          </p>
        </div>

        <div className="w-full backdrop-blur-sm bg-background/50 rounded-xl shadow-xl p-6 animate-scale-in">
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
      </div>
    </div>
  );
};

export default Index;
