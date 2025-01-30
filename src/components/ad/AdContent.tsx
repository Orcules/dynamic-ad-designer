import { ArrowBigDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdContentProps {
  headline?: string;
  ctaText?: string;
  textStyle: any;
  buttonStyle: any;
  templateStyle?: string;
  isButtonHovered: boolean;
  onButtonHover: (isHovered: boolean) => void;
}

export function AdContent({
  headline,
  ctaText,
  textStyle,
  buttonStyle,
  templateStyle,
  isButtonHovered,
  onButtonHover,
}: AdContentProps) {
  if (!headline && !ctaText) return null;

  const isBottomOverlay = templateStyle?.startsWith('overlay-bottom-');

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className={cn(
        "flex-1 flex flex-col",
        isBottomOverlay ? "justify-end" : "justify-center"
      )}>
        <div className={cn(
          "relative w-full flex flex-col min-h-[300px]",
          isBottomOverlay && "bg-gradient-to-t from-black/80 to-transparent"
        )}>
          {headline && (
            <div className="px-6 mt-12">
              <h2 
                className={cn(
                  "text-center leading-tight break-words",
                  isBottomOverlay ? "max-w-full" : "max-w-[90%]",
                  templateStyle === 'minimal' ? 'text-black' : 'text-white'
                )}
                style={textStyle}
              >
                {headline}
              </h2>
            </div>
          )}
          
          {ctaText && (
            <div className="w-full flex justify-center items-center mt-auto px-6 pb-8">
              <div 
                className="relative transform flex items-center justify-center gap-2 mx-auto"
                style={buttonStyle}
                onMouseEnter={() => onButtonHover(true)}
                onMouseLeave={() => onButtonHover(false)}
              >
                <span className="block">
                  {ctaText}
                </span>
                <ArrowBigDown 
                  className={cn(
                    "w-4 h-4 transition-transform duration-300",
                    isButtonHovered ? "translate-y-1" : ""
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}