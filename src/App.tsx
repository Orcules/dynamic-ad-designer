
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import { setupAccessibilityFixes } from "./utils/accessibility";

const queryClient = new QueryClient();

const App = () => {
  // Call the setupAccessibilityFixes function when the app initializes
  useEffect(() => {
    // setupAccessibilityFixes כולל בתוכו גם את suppressDialogWarnings
    const cleanup = setupAccessibilityFixes();
    
    return () => {
      // Make sure to call the cleanup function when the component unmounts
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
