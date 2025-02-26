
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import { setupAccessibilityFixes, suppressDialogWarnings, monkeyPatchDialogContent } from "./utils/accessibility";

const queryClient = new QueryClient();

const App = () => {
  // Call the setupAccessibilityFixes function when the app initializes
  useEffect(() => {
    // וידוא שהפונקציות להשתקת האזהרות מופעלות גם מהאפליקציה, למקרה שהרינדור קורה לפני שהקוד במודול מופעל
    suppressDialogWarnings();
    
    // monkeyPatchDialogContent כדי לתקן את הבעיה של דיאלוגים מובנים
    monkeyPatchDialogContent();
    
    // setupAccessibilityFixes כולל בתוכו גם את suppressDialogWarnings
    // אבל מוסיף עוד פיצ'רים כמו MutationObserver 
    const cleanup = setupAccessibilityFixes();
    
    return () => {
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
