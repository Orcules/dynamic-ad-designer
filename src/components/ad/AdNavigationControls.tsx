
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdNavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  currentIndex: number;
  totalImages: number;
  disabled?: boolean;
}

export function AdNavigationControls({
  onPrevious,
  onNext,
  currentIndex,
  totalImages,
  disabled = false
}: AdNavigationControlsProps) {
  const [internalDisabled, setInternalDisabled] = useState(disabled);
  const [isVisible, setIsVisible] = useState(false);
  
  // Effect to handle visibility animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Effect to handle debouncing navigation
  useEffect(() => {
    setInternalDisabled(disabled);
  }, [disabled]);
  
  // Debounce navigation clicks to prevent rapid clicking
  const handlePrevious = (e: React.MouseEvent) => {
    if (internalDisabled) return;
    e.preventDefault();
    e.stopPropagation();
    
    setInternalDisabled(true);
    console.log("Navigation: Previous clicked");
    
    // Execute the actual navigation
    onPrevious();
    
    // Re-enable after a short delay
    setTimeout(() => {
      setInternalDisabled(false);
    }, 500);
  };

  const handleNext = (e: React.MouseEvent) => {
    if (internalDisabled) return;
    e.preventDefault();
    e.stopPropagation();
    
    setInternalDisabled(true);
    console.log("Navigation: Next clicked");
    
    // Execute the actual navigation
    onNext();
    
    // Re-enable after a short delay
    setTimeout(() => {
      setInternalDisabled(false);
    }, 500);
  };

  if (totalImages <= 1) {
    return null;
  }

  return (
    <div className={cn(
      "absolute inset-0 flex items-center justify-between pointer-events-none z-40",
      isVisible ? "opacity-100" : "opacity-0",
      "transition-opacity duration-300"
    )}>
      <div className="group ml-4 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "opacity-80 hover:opacity-100 transition-opacity duration-200 rounded-full bg-primary/80 hover:bg-primary text-primary-foreground h-12 w-12 border-2 border-primary shadow-lg z-50",
            (internalDisabled || disabled) && "opacity-50 cursor-not-allowed"
          )}
          onClick={handlePrevious}
          disabled={totalImages <= 1 || internalDisabled || disabled}
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
          className={cn(
            "opacity-80 hover:opacity-100 transition-opacity duration-200 rounded-full bg-primary/80 hover:bg-primary text-primary-foreground h-12 w-12 border-2 border-primary shadow-lg z-50",
            (internalDisabled || disabled) && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleNext}
          disabled={totalImages <= 1 || internalDisabled || disabled}
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
