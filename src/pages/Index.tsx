
import { useState, useEffect } from "react";
import AdEditor from "@/components/AdEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, ExternalLink } from "lucide-react";

interface GeneratedAd {
  id: string;
  name: string;
  image_url: string;
  preview_url: string;
}

const Index = () => {
  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
  const [latestAd, setLatestAd] = useState<GeneratedAd | null>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    fetchGeneratedAds();
  }, []);

  const fetchGeneratedAds = async () => {
    console.log("Starting to fetch generated ads...");
    const { data, error } = await supabase
      .from('generated_ads')
      .select('id, name, image_url, preview_url')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching ads:", error);
      toast.error("Error loading ads");
      return;
    }

    if (data && data.length > 0) {
      console.log("Successfully fetched ads. Count:", data.length);
      setGeneratedAds(data);
      setLatestAd(data[0]); // Set the most recent ad
    } else {
      console.log("No ads data returned");
    }
  };

  const handleAdGenerated = async (adData: any) => {
    console.log("Ad generated:", adData);
    await fetchGeneratedAds(); // Refresh the list immediately after a new ad is generated
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

        {latestAd && (
          <div className="w-full backdrop-blur-sm bg-background/50 rounded-xl shadow-xl p-6 animate-scale-in">
            <h2 className="text-xl font-semibold mb-4">Latest Generated Ad</h2>
            <div className="flex flex-col p-4 bg-card rounded-lg hover:bg-accent/5 transition-colors">
              <span className="text-sm font-medium mb-2">{latestAd.name}</span>
              <div className="relative aspect-[9/16] mb-2 rounded-md overflow-hidden">
                <img 
                  src={latestAd.preview_url || latestAd.image_url} 
                  alt={latestAd.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <a
                href={latestAd.preview_url || latestAd.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm mt-2"
              >
                View Ad <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}

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

        {generatedAds.length > 0 && (
          <div className="space-y-4 backdrop-blur-sm bg-background/50 rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">All Generated Ads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedAds.map((ad) => (
                <div 
                  key={ad.id} 
                  className="flex flex-col p-4 bg-card rounded-lg hover:bg-accent/5 transition-colors"
                >
                  <span className="text-sm font-medium mb-2">{ad.name}</span>
                  {(ad.preview_url || ad.image_url) && (
                    <>
                      <div className="relative aspect-[9/16] mb-2 rounded-md overflow-hidden">
                        <img 
                          src={ad.preview_url || ad.image_url} 
                          alt={ad.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <a
                        href={ad.preview_url || ad.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm mt-auto"
                      >
                        View Ad <ExternalLink className="h-4 w-4" />
                      </a>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
