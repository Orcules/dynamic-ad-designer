
import { useState, useEffect, useLayoutEffect } from "react";
import AdEditor from "@/components/AdEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Logger } from "@/utils/logger";
import { GeneratedAdsList } from "@/components/GeneratedAdsList";
import { Separator } from "@/components/ui/separator";
import { suppressDialogWarnings, monkeyPatchDialogContent, setupAccessibilityFixes } from "@/utils/accessibility";

interface GeneratedAd {
  id: string;
  name: string;
  image_url: string;
  preview_url?: string;
  platform?: string;
}

const Index = () => {
  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Apply suppressDialogWarnings with useLayoutEffect, before rendering
  useLayoutEffect(() => {
    suppressDialogWarnings();
    monkeyPatchDialogContent();
  }, []);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    Logger.info("Application started - Initial mount");
    
    // Apply all accessibility functions here as well
    suppressDialogWarnings();
    monkeyPatchDialogContent();
    const cleanup = setupAccessibilityFixes();
    
    fetchGeneratedAds();

    // Apply again after a short time, to catch dialogs created later
    const timer1 = setTimeout(() => {
      monkeyPatchDialogContent();
    }, 500);
    
    const timer2 = setTimeout(() => {
      monkeyPatchDialogContent();
    }, 1500);

    return () => {
      cleanup();
      clearTimeout(timer1);
      clearTimeout(timer2);
      document.documentElement.classList.remove('dark');
      Logger.info("Application unmounting");
    };
  }, []);

  const fetchGeneratedAds = async () => {
    try {
      setIsUpdating(true);
      Logger.info("Starting to fetch generated ads...");
      
      const { data, error } = await supabase
        .from('generated_ads')
        .select('id, name, image_url, preview_url, platform')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        Logger.error(`Error fetching ads: ${error.message}`);
        toast.error("Error loading ads");
        return;
      }

      if (data) {
        Logger.info(`Successfully fetched ${data.length} ads`);
        setGeneratedAds(data);
      } else {
        Logger.warn("No ads data returned");
      }
    } catch (err) {
      Logger.error(`Unexpected error during fetch: ${err instanceof Error ? err.message : String(err)}`);
      toast.error("Unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAdGenerated = async (adData: any) => {
    Logger.info(`Ad generated with ID: ${adData.id}`);

    try {
      // Create new record in generated_ads table
      const { data, error } = await supabase
        .from('generated_ads')
        .insert([
          {
            name: adData.name,
            headline: adData.headline,
            description: adData.description,
            cta_text: adData.cta_text,
            platform: adData.platform,
            template_style: adData.template_style,
            image_url: adData.image_url,
            preview_url: adData.preview_url || adData.image_url, // Ensure there's always a value
            width: adData.width,
            height: adData.height
          }
        ])
        .select();

      if (error) {
        Logger.error(`Error creating ad record: ${error.message}`);
        toast.error("Failed to save ad");
        return;
      }

      // Refresh list of generated ads
      Logger.info("Ad saved to database, refreshing list");
      await fetchGeneratedAds();
      
      toast.success("Ad created successfully!");
    } catch (err) {
      Logger.error(`Error refreshing ads after generation: ${err instanceof Error ? err.message : String(err)}`);
      toast.error("Error saving ad");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10 text-foreground p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full animate-fade-in">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Dynamic Ad Designer {isUpdating ? '(Updating...)' : ''}
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
        
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Generated Ads</h2>
            <p className="text-muted-foreground">All ads you've created will appear here for download and reuse</p>
          </div>
          
          <Separator className="my-4" />
          
          <GeneratedAdsList 
            ads={generatedAds} 
            isLoading={isUpdating} 
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
