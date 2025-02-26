
import { useState, useEffect } from "react";
import AdEditor from "@/components/AdEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Logger } from "@/utils/logger";
import { GeneratedAdsList } from "@/components/GeneratedAdsList";
import { Separator } from "@/components/ui/separator";
import { suppressDialogWarnings } from "@/utils/accessibility";

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

  useEffect(() => {
    document.documentElement.classList.add('dark');
    Logger.info("Application started - Initial mount");
    
    // וידוא שההתראות מושתקות גם ברמת הדף
    suppressDialogWarnings();
    
    fetchGeneratedAds();

    return () => {
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

      Logger.info(`Supabase response received - Data count: ${data?.length || 0}`);

      if (error) {
        Logger.error(`Error fetching ads: ${error.message}`);
        toast.error("Error loading ads");
        return;
      }

      if (data) {
        Logger.info(`Successfully fetched ${data.length} ads`);
        setGeneratedAds(data);
        Logger.info("State updated with new ads");
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
      // יצירת רשומה חדשה בטבלת generated_ads
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
            preview_url: adData.preview_url || adData.image_url, // וידוא שיש תמיד ערך
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

      // רענון רשימת המודעות שנוצרו
      Logger.info("Ad saved to database, refreshing list");
      await fetchGeneratedAds();
      Logger.info("Ads refreshed after generation");
      
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
            <h2 className="text-2xl font-bold tracking-tight">המודעות שנוצרו</h2>
            <p className="text-muted-foreground">כל המודעות שייצרת יופיעו כאן להורדה ושימוש מחדש</p>
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
