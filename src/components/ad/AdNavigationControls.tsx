
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdNavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  currentIndex: number;
  totalImages: number;
  hidden?: boolean; // New prop to hide controls during generation
  captureMode?: boolean; // New prop to optimize for image capture
}

export function AdNavigationControls({
  onPrevious,
  onNext,
  currentIndex,
  totalImages,
  hidden = false,
  captureMode = false,
}: AdNavigationControlsProps) {
  // Don't render anything if there's only one or no images or if hidden is true
  if (totalImages <= 1 || hidden) return null;
  
  return (
    <div className={cn(
      "absolute inset-0 flex items-center justify-between pointer-events-none px-4",
      captureMode && "image-capture-visible" // CSS class to ensure visibility during capture
    )}>
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "rounded-full bg-white/80 hover:bg-white text-gray-800 pointer-events-auto h-12 w-12 border-2 border-white shadow-lg z-10",
          captureMode && "opacity-100 visible"
        )}
        onClick={onPrevious}
        data-html2canvas-capture="true" // Ensure this element is captured
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "rounded-full bg-white/80 hover:bg-white text-gray-800 pointer-events-auto h-12 w-12 border-2 border-white shadow-lg z-10",
          captureMode && "opacity-100 visible"
        )}
        onClick={onNext}
        data-html2canvas-capture="true" // Ensure this element is captured
      >
        <ArrowRight className="h-6 w-6" />
      </Button>
      
      <div className={cn(
        "absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10",
        captureMode && "opacity-100 visible"
      )}
        data-html2canvas-capture="true" // Ensure this element is captured
      >
        {Array.from({ length: totalImages }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-3 h-3 rounded-full transition-colors",
              currentIndex === index ? "bg-white" : "bg-white/50",
              captureMode && "opacity-100 visible"
            )}
          />
        ))}
      </div>
    </div>
  );
}
