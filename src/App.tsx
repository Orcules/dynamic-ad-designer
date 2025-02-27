
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import TestUpload from "./pages/TestUpload";
import { suppressDialogWarnings } from "./utils/accessibility";

const queryClient = new QueryClient();

const App = () => {
  // Call the suppressDialogWarnings function when the app initializes
  useEffect(() => {
    try {
      suppressDialogWarnings();
    } catch (error) {
      console.error("Error suppressing dialog warnings:", error);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
