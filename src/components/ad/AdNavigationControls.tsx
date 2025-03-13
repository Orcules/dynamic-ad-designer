
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

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
  return (
    <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
      <div className="group ml-4">
        <Button
          variant="outline"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full bg-primary/80 hover:bg-primary text-primary-foreground pointer-events-auto h-12 w-12 border-2 border-primary shadow-lg z-30"
          onClick={onPrevious}
          disabled={totalImages <= 1}
        >
          <ArrowLeft className="h-8 w-8" />
          <span className="sr-only">Previous image</span>
        </Button>
      </div>
      
      <div className="group mr-4">
        <Button
          variant="outline"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full bg-primary/80 hover:bg-primary text-primary-foreground pointer-events-auto h-12 w-12 border-2 border-primary shadow-lg z-30"
          onClick={onNext}
          disabled={totalImages <= 1}
        >
          <ArrowRight className="h-8 w-8" />
          <span className="sr-only">Next image</span>
        </Button>
      </div>
      
      {totalImages > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
