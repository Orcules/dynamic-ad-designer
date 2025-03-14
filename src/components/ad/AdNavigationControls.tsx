
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdNavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  currentIndex: number;
  totalImages: number;
  hidden?: boolean; // New prop to hide controls during generation
}

export function AdNavigationControls({
  onPrevious,
  onNext,
  currentIndex,
  totalImages,
  hidden = false,
}: AdNavigationControlsProps) {
  // Don't render anything if there's only one or no images or if hidden is true
  if (totalImages <= 1 || hidden) return null;
  
  return (
    <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-4 z-20">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full bg-white/80 hover:bg-white text-gray-800 pointer-events-auto h-12 w-12 border-2 border-white shadow-lg z-10"
        onClick={onPrevious}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full bg-white/80 hover:bg-white text-gray-800 pointer-events-auto h-12 w-12 border-2 border-white shadow-lg z-10"
        onClick={onNext}
      >
        <ArrowRight className="h-6 w-6" />
      </Button>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {Array.from({ length: totalImages }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-3 h-3 rounded-full transition-colors",
              currentIndex === index ? "bg-white" : "bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
