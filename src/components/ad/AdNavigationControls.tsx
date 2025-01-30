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
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="relative w-full h-full">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white z-50 pointer-events-auto h-12 w-12 border-2"
          onClick={onPrevious}
          disabled={totalImages <= 1}
        >
          <ArrowLeft className="h-8 w-8" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white z-50 pointer-events-auto h-12 w-12 border-2"
          onClick={onNext}
          disabled={totalImages <= 1}
        >
          <ArrowRight className="h-8 w-8" />
        </Button>
        {totalImages > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-50">
            {Array.from({ length: totalImages }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  currentIndex === index ? "bg-white" : "bg-white/50"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}