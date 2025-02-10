
import { useState, useEffect } from "react";
import AdEditor from "@/components/AdEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, ExternalLink } from "lucide-react";

interface GeneratedAd {
  id: string;
  name: string;
  image_url: string;
  created_at: string;
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
      .select('id, name, image_url, created_at')
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
    }
  };

  const handleAdGenerated = async (adData: any) => {
    console.log("Starting ad generation with data:", adData);
    
    try {
      if (!adData.headline) {
        console.log("Validation failed: Missing headline");
        toast.error("Please enter a headline");
        return;
      }

      if (!adData.imageUrl) {
        console.log("Validation failed: Missing image");
        toast.error("Please provide an image");
        return;
      }

      const adToInsert = {
        name: adData.headline || 'Untitled Ad',
        headline: adData.headline,
        description: adData.description,
        cta_text: adData.cta_text,
        font_url: adData.font_url,
        platform: adData.platform,
        template_style: adData.template_style || 'modern',
        accent_color: adData.accent_color || '#4A90E2',
        cta_color: adData.cta_color || '#4A90E2',
        overlay_color: adData.overlay_color || '#000000',
        text_color: adData.text_color || '#FFFFFF',
        description_color: adData.description_color || '#333333',
        image_url: adData.imageUrl,
        width: adData.width || 1080,
        height: adData.height || 1920,
        status: 'completed'
      };

      console.log("Attempting to insert ad with data:", adToInsert);

      const { data: insertedData, error: insertError } = await supabase
        .from('generated_ads')
        .insert([adToInsert])
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting ad:", insertError);
        throw insertError;
      }
      
      console.log("Ad created successfully:", insertedData);
      toast.success("Ad created successfully");
      
      console.log("Refreshing ads list...");
      await fetchGeneratedAds();
      
    } catch (error: any) {
      console.error("Error generating ad:", error);
      toast.error(error.message || "Error creating ad");
    }
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

        {generatedAds.length > 0 && (
          <div className="space-y-4 backdrop-blur-sm bg-background/50 rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Generated Ads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedAds.map((ad) => (
                <div 
                  key={ad.id} 
                  className="flex flex-col space-y-2 p-4 bg-card rounded-lg hover:bg-accent/5 transition-colors"
                >
                  {ad.image_url && (
                    <a
                      href={ad.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-video overflow-hidden rounded-lg"
                    >
                      <img 
                        src={ad.image_url} 
                        alt={ad.name}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </a>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{ad.name}</span>
                    <a
                      href={ad.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-sm"
                    >
                      View <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(ad.created_at).toLocaleDateString()}
                  </span>
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
