
import { useState, useEffect, useLayoutEffect } from "react";
import AdEditor from "@/components/AdEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, AlertCircle } from "lucide-react";
import { Logger } from "@/utils/logger";
import { GeneratedAdsList } from "@/components/GeneratedAdsList";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { suppressDialogWarnings, monkeyPatchDialogContent, setupAccessibilityFixes } from "@/utils/accessibility";
import { Link } from "react-router-dom";

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
  const [loadError, setLoadError] = useState<string | null>(null);

  // Apply suppressDialogWarnings with useLayoutEffect, before rendering
  useLayoutEffect(() => {
    try {
      suppressDialogWarnings();
      monkeyPatchDialogContent();
    } catch (error) {
      console.error("Error in useLayoutEffect accessibility setup:", error);
    }
  }, []);

  useEffect(() => {
    try {
      document.documentElement.classList.add('dark');
      Logger.info("Application started - Initial mount");
      
      // Apply all accessibility functions here as well
      suppressDialogWarnings();
      monkeyPatchDialogContent();
      
      let cleanup = () => {};
      try {
        cleanup = setupAccessibilityFixes();
      } catch (accessError) {
        console.error("Error setting up accessibility fixes:", accessError);
      }
      
      fetchGeneratedAds();

      // Apply again after a short time, to catch dialogs created later
      const timer1 = setTimeout(() => {
        try {
          monkeyPatchDialogContent();
        } catch (e) {
          console.error("Error in delayed monkeyPatchDialogContent:", e);
        }
      }, 500);
      
      const timer2 = setTimeout(() => {
        try {
          monkeyPatchDialogContent();
        } catch (e) {
          console.error("Error in second delayed monkeyPatchDialogContent:", e);
        }
      }, 1500);

      return () => {
        try {
          cleanup();
        } catch (e) {
          console.error("Error in cleanup function:", e);
        }
        clearTimeout(timer1);
        clearTimeout(timer2);
        document.documentElement.classList.remove('dark');
        Logger.info("Application unmounting");
      };
    } catch (error) {
      console.error("Fatal error in main useEffect:", error);
      return () => {};
    }
  }, []);

  // Function to fetch data with timeout
  const fetchWithTimeout = async (timeoutMs: number, fetchFn: () => Promise<any>) => {
    return new Promise<any>(async (resolve, reject) => {
      // Set up the timeout
      const timeoutId = setTimeout(() => {
        reject(new Error(`Request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      
      try {
        // Execute the provided function
        const result = await fetchFn();
        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  };

  const fetchGeneratedAds = async () => {
    try {
      setIsUpdating(true);
      setLoadError(null);
      
      Logger.info("Starting to fetch generated ads with smaller batch size...");
      
      // Use a smaller limit to reduce the chance of timeout
      const limit = 5;
      
      try {
        // We'll request a smaller batch first to get something showing quickly
        const { data, error } = await fetchWithTimeout(5000, async () => {
          return await supabase
            .from('generated_ads')
            .select('id, name, image_url, preview_url, platform')
            .order('created_at', { ascending: false })
            .limit(limit);
        });
        
        // Handle any errors from the first query
        if (error) {
          Logger.error(`Error in initial fetch: ${error.message}`);
          throw error; // Let the catch block handle this
        }

        // If we got data from the first query, use it
        if (data) {
          Logger.info(`Successfully fetched initial ${data.length} ads`);
          setGeneratedAds(data);
          
          // Only try to fetch more if we actually got some data
          if (data.length > 0) {
            try {
              // If first batch succeeded, try to get more in the background
              Logger.info("Fetching additional ads in background...");
              
              const { data: moreData, error: moreError } = await fetchWithTimeout(8000, async () => {
                return await supabase
                  .from('generated_ads')
                  .select('id, name, image_url, preview_url, platform')
                  .order('created_at', { ascending: false })
                  .range(limit, limit + 10);
              });
                
              if (!moreError && moreData && moreData.length > 0) {
                Logger.info(`Fetched ${moreData.length} additional ads`);
                // Combine without duplicates
                setGeneratedAds(prev => {
                  const existingIds = new Set(prev.map(ad => ad.id));
                  const newAds = moreData.filter(ad => !existingIds.has(ad.id));
                  return [...prev, ...newAds];
                });
              }
            } catch (moreErr) {
              // We already have some data, so just log this error
              Logger.warn(`Error fetching additional ads: ${moreErr instanceof Error ? moreErr.message : String(moreErr)}`);
              // Don't show an error to the user since we have some data
            }
          }
        } else {
          Logger.warn("No ads data returned from initial query");
          setGeneratedAds([]);
        }
      } catch (initialErr) {
        // Try a simpler fallback query if the initial one fails
        try {
          Logger.info("Trying fallback simple query...");
          
          const { data: fallbackData, error: fallbackError } = await fetchWithTimeout(3000, async () => {
            return await supabase
              .from('generated_ads')
              .select('id, name, image_url')
              .limit(3);
          });
            
          if (fallbackError) {
            // If even the fallback fails, show the error
            Logger.error(`Fallback query also failed: ${fallbackError.message}`);
            throw fallbackError;
          }
          
          if (fallbackData) {
            // Use fallback data if available
            Logger.info(`Fallback query succeeded with ${fallbackData.length} results`);
            setGeneratedAds(fallbackData);
          } else {
            // No data in fallback query
            setGeneratedAds([]);
          }
        } catch (fallbackErr) {
          const errorMessage = initialErr instanceof Error ? initialErr.message : String(initialErr);
          Logger.error(`Fallback attempt failed: ${fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)}`);
          setLoadError(`Failed to load ads: ${errorMessage}`);
          toast.error("Error loading ads");
          setGeneratedAds([]);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      Logger.error(`Unexpected error during fetch: ${errorMessage}`);
      setLoadError(`Failed to load ads: ${errorMessage}`);
      toast.error("Unexpected error occurred");
      // If there was an error, we'll show an empty list
      setGeneratedAds([]);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAdGenerated = async (adData: any) => {
    Logger.info(`Ad generated with ID: ${adData.id}`);

    // Create a new ad object with the required fields
    const newAd: GeneratedAd = {
      id: adData.id || `temp-${Date.now()}`, // If no ID is provided, create a temporary one
      name: adData.name || `New Ad - ${new Date().toLocaleString()}`,
      image_url: adData.image_url,
      preview_url: adData.preview_url || adData.image_url,
      platform: adData.platform
    };

    // Immediately add the new ad to the local state for immediate feedback
    setGeneratedAds(prev => [newAd, ...prev]);
    
    // Notify the user
    toast.success("Ad created successfully!");

    try {
      Logger.info(`Saving ad to database: ${JSON.stringify({
        name: adData.name,
        platform: adData.platform,
        image_url: adData.image_url ? adData.image_url.substring(0, 50) + '...' : 'undefined'
      })}`);

      // Create a new record in the generated_ads table
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
            width: adData.width || 1080,
            height: adData.height || 1080
          }
        ])
        .select();

      if (error) {
        Logger.error(`Error creating ad record: ${error.message}`);
        toast.error("Failed to save ad to database, but it's available in your local session");
        return;
      }

      // If we successfully saved to the database
      if (data && data.length > 0) {
        Logger.info(`Ad saved to database with ID: ${data[0].id}`);
        
        // Update our local state with the real database ID
        setGeneratedAds(prev => {
          const updatedAds = prev.map(ad => 
            ad.id === newAd.id ? {
              ...ad,
              id: data[0].id
            } : ad
          );
          return updatedAds;
        });
      }
      
      // Also refresh the list to ensure consistency, but don't wait for it
      fetchGeneratedAds().catch(err => {
        Logger.warn(`Error refreshing ads list: ${err instanceof Error ? err.message : String(err)}`);
      });
    } catch (err) {
      Logger.error(`Error saving ad to database: ${err instanceof Error ? err.message : String(err)}`);
      toast.error("Error saving ad to database, but it's available in your local session");
    }
  };

  const handleRetryLoad = () => {
    fetchGeneratedAds();
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
            <div className="ml-4">
              <Link 
                to="/test-upload" 
                className="text-sm bg-secondary/20 hover:bg-secondary/30 px-3 py-1 rounded-full transition-colors"
              >
                Test Upload Tool
              </Link>
            </div>
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

          {loadError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Ads</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <p>{loadError}</p>
                <Button 
                  variant="outline" 
                  className="w-fit mt-2" 
                  onClick={handleRetryLoad}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
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
