
import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
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
  const [retryCount, setRetryCount] = useState(0);
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);
  const [adsFetchComplete, setAdsFetchComplete] = useState(false);
  
  // Ref to track whether ads have been loaded
  const adsLoadedRef = useRef(false);

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
      
      // Fetch ads with a longer delay to ensure UI loads completely first
      // Increased delay from 500ms to 1000ms
      const timer = setTimeout(() => {
        if (!adsLoadedRef.current) {
          fetchGeneratedAds();
        }
      }, 1000);

      // Apply again after a short time, to catch dialogs created later
      const timer1 = setTimeout(() => {
        try {
          monkeyPatchDialogContent();
        } catch (e) {
          console.error("Error in delayed monkeyPatchDialogContent:", e);
        }
      }, 800);
      
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
        clearTimeout(timer);
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

  // Refetch when retry count changes
  useEffect(() => {
    if (retryCount > 0) {
      fetchGeneratedAds();
    }
  }, [retryCount]);

  // Optimized fetch function with smaller batches and delay
  const fetchGeneratedAds = useCallback(async () => {
    if (isUpdating || adsLoadedRef.current) return;
    
    try {
      setIsUpdating(true);
      setLoadError(null);
      
      Logger.info("Starting to fetch generated ads with optimized strategy...");
      
      // Try with a reduced limit and shorter timeout first - further reduced to 1
      try {
        const { data: minimalData, error: minimalError } = await supabase
          .from('generated_ads')
          .select('id, name, image_url, preview_url, platform')
          .limit(1)
          .order('created_at', { ascending: false })
          .maybeSingle();
          
        if (minimalError) {
          Logger.warn(`Minimal query error: ${minimalError.message}`);
        } else if (minimalData) {
          // If we get a single result, convert to array
          const dataArray = Array.isArray(minimalData) ? minimalData : [minimalData];
          if (dataArray.length > 0) {
            Logger.info(`Got ${dataArray.length} ads with minimal query`);
            setGeneratedAds(dataArray);
            setHasFetchedInitial(true);
            // Mark ads as loaded
            adsLoadedRef.current = true;
          }
        }
      } catch (minimalErr) {
        Logger.warn(`Minimal fetch failed: ${minimalErr instanceof Error ? minimalErr.message : String(minimalErr)}`);
      }
      
      // Fallback to direct storage query if database is having issues
      if (!hasFetchedInitial) {
        try {
          Logger.info("Trying alternate storage-based approach for retrieving ads");
          
          // Further reduced from 5 to 3 for better initial performance
          const { data: storageFiles, error: storageError } = await supabase.storage
            .from('ad-images')
            .list('full-ads', {
              limit: 3,
              sortBy: { column: 'created_at', order: 'desc' }
            });
            
          if (storageError) {
            Logger.error(`Storage list error: ${storageError.message}`);
          } else if (storageFiles && storageFiles.length > 0) {
            // Convert storage files to ad objects
            const storageBasedAds = storageFiles
              .filter(file => file.name && !file.name.includes('.gitkeep'))
              .map((file, index) => {
                const { data: { publicUrl } } = supabase.storage
                  .from('ad-images')
                  .getPublicUrl(`full-ads/${file.name}`);
                  
                return {
                  id: `storage-${index}-${file.id || Date.now()}`,
                  name: `Generated Ad ${index + 1}`,
                  image_url: publicUrl,
                  preview_url: publicUrl,
                  platform: 'unknown'
                };
              });
              
            if (storageBasedAds.length > 0) {
              Logger.info(`Retrieved ${storageBasedAds.length} ads from storage`);
              setGeneratedAds(storageBasedAds);
              setHasFetchedInitial(true);
              // Mark ads as loaded
              adsLoadedRef.current = true;
            }
          }
        } catch (storageErr) {
          Logger.error(`Storage approach failed: ${storageErr instanceof Error ? storageErr.message : String(storageErr)}`);
        }
      }
      
      // If we still have no data, try a simpler database query with no ordering
      if (!hasFetchedInitial) {
        try {
          const { data: simpleData, error: simpleError } = await supabase
            .from('generated_ads')
            .select('id, name, image_url, preview_url, platform')
            .limit(2); // Further reduced from 3 to 2
            
          if (simpleError) {
            throw simpleError;
          }
          
          if (simpleData && simpleData.length > 0) {
            Logger.info(`Got ${simpleData.length} ads with simple query`);
            setGeneratedAds(simpleData);
            setHasFetchedInitial(true);
            // Mark ads as loaded
            adsLoadedRef.current = true;
          } else {
            // No data available
            Logger.info("No ad data found in any system");
            setGeneratedAds([]);
            setHasFetchedInitial(true);
            // Mark ads as loaded even if empty
            adsLoadedRef.current = true;
          }
        } catch (simpleErr) {
          Logger.error(`Simple fetch error: ${simpleErr instanceof Error ? simpleErr.message : String(simpleErr)}`);
          
          if (!hasFetchedInitial) {
            const errorMessage = simpleErr instanceof Error ? simpleErr.message : String(simpleErr);
            setLoadError(`Failed to load ads: ${errorMessage}`);
            toast.error("Error loading ads", {
              description: "Please try again or check your connection"
            });
          }
        }
      }

      setAdsFetchComplete(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      Logger.error(`Unexpected error during fetch: ${errorMessage}`);
      
      if (!hasFetchedInitial) {
        setLoadError(`Failed to load ads: ${errorMessage}`);
        toast.error("Unexpected error occurred", {
          description: "There was a problem loading your ads"
        });
      }
      
      setAdsFetchComplete(true);
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, hasFetchedInitial]);

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
    } catch (err) {
      Logger.error(`Error saving ad to database: ${err instanceof Error ? err.message : String(err)}`);
      toast.error("Error saving ad to database, but it's available in your local session");
    }
  };

  const handleRetryLoad = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10 text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full animate-fade-in">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
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

        <div className="w-full backdrop-blur-sm bg-background/50 rounded-xl shadow-xl p-4 md:p-6 animate-scale-in">
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

          {loadError && !hasFetchedInitial && (
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
            isLoading={isUpdating && !hasFetchedInitial} 
            onRetryLoad={handleRetryLoad}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
