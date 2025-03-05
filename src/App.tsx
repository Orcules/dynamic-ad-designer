
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import TestUpload from "./pages/TestUpload";
import { suppressDialogWarnings } from "./utils/accessibility";

// יצירת קליינט שאילתות גלובלי עם הגדרות משופרות
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,             // מספר ניסיונות חוזרים במקרה של שגיאה
      staleTime: 1000 * 60, // זמן תקף לנתונים (1 דקה)
      refetchOnWindowFocus: false // לא לשאול שוב בפוקוס חלון
    }
  }
});

const App = () => {
  // קריאה לפונקציה לדיכוי אזהרות דיאלוג בטעינת האפליקציה
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
            <Route path="/test-upload" element={<TestUpload />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
