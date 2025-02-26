
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useLayoutEffect } from "react";
import Index from "./pages/Index";
import { setupAccessibilityFixes, suppressDialogWarnings, monkeyPatchDialogContent } from "./utils/accessibility";

const queryClient = new QueryClient();

// תיקון נגישות שמופעל לפני הרינדור הראשוני
if (typeof window !== 'undefined') {
  suppressDialogWarnings();
  monkeyPatchDialogContent();
}

const App = () => {
  // הפעלת setupAccessibilityFixes כשהאפליקציה מאותחלת - לפני הרינדור
  useLayoutEffect(() => {
    // וידוא שהפונקציות להשתקת האזהרות מופעלות גם מהאפליקציה
    suppressDialogWarnings();
    
    // monkeyPatchDialogContent כדי לתקן את הבעיה של דיאלוגים מובנים
    monkeyPatchDialogContent();
  }, []);
  
  // הגדרה נוספת - לאחר הרינדור
  useEffect(() => {
    // setupAccessibilityFixes כולל גם את suppressDialogWarnings 
    // אבל מוסיף עוד פיצ'רים כמו MutationObserver
    const cleanup = setupAccessibilityFixes();
    
    // תיקון נגישות אחרי 500 מילישניות
    const timer = setTimeout(() => {
      monkeyPatchDialogContent();
    }, 500);
    
    return () => {
      if (cleanup) cleanup();
      clearTimeout(timer);
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
