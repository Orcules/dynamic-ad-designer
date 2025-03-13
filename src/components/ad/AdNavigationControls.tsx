
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdNavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  currentIndex: number;
  totalImages: number;
}

export function AdNavigationControls({
  onPrevious,
  onNext,
  currentIndex,
  totalImages,
}: AdNavigationControlsProps) {
  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Navigation: Previous clicked");
    onPrevious();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Navigation: Next clicked");
    onNext();
  };

  if (totalImages <= 1) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-40">
      <div className="group ml-4 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="outline"
          size="icon"
          className="opacity-80 hover:opacity-100 transition-opacity duration-200 rounded-full bg-primary/80 hover:bg-primary text-primary-foreground h-12 w-12 border-2 border-primary shadow-lg z-50"
          onClick={handlePrevious}
          disabled={totalImages <= 1}
          data-navigation-control="previous"
        >
          <ArrowLeft className="h-8 w-8" />
          <span className="sr-only">Previous image</span>
        </Button>
      </div>
      
      <div className="group mr-4 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="outline"
          size="icon"
          className="opacity-80 hover:opacity-100 transition-opacity duration-200 rounded-full bg-primary/80 hover:bg-primary text-primary-foreground h-12 w-12 border-2 border-primary shadow-lg z-50"
          onClick={handleNext}
          disabled={totalImages <= 1}
          data-navigation-control="next"
        >
          <ArrowRight className="h-8 w-8" />
          <span className="sr-only">Next image</span>
        </Button>
      </div>
      
      {totalImages > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
          {Array.from({ length: totalImages }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-3 h-3 rounded-full transition-colors shadow-md",
                currentIndex === index ? "bg-white" : "bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
