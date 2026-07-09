
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import { suppressDialogWarnings } from "./utils/accessibility";

// Create a global query client with tuned defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,             // retry attempts on error
      staleTime: 1000 * 60, // data considered fresh for 1 minute
      refetchOnWindowFocus: false // don't refetch on window focus
    }
  }
});

const App = () => {
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');

  // Update document direction when dir state changes
  useEffect(() => {
    document.documentElement.dir = dir;
  }, [dir]);

  // Function to update direction that can be passed to context
  const updateDirection = (language: string) => {
    const newDir = language === 'he' || language === 'ar' ? 'rtl' : 'ltr';
    setDir(newDir);
  };

  // Apply dialog accessibility fixes on app load
  useEffect(() => {
    try {
      suppressDialogWarnings();
      console.log("Dialog warnings suppressed successfully");
    } catch (error) {
      console.error("Error suppressing dialog warnings:", error);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner closeButton position="bottom-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
