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
    <div className="flex-1 flex items-stretch px-4 w-full">
      <div className={cn(
        "flex flex-col w-full h-full p-4 box-border",
        isBottomOverlay ? "justify-end" : "justify-center"
      )}>
        <div className={cn(
          "w-full flex flex-col items-center",
          isBottomOverlay && "relative"
        )}>
          {headline && (
            <h2 
              className={cn(
                "text-center leading-tight break-words mb-4",
                isBottomOverlay ? "max-w-full" : "max-w-[90%]",
                templateStyle === 'minimal' ? 'text-black' : 'text-white'
              )}
              style={textStyle}
            >
              {headline}
            </h2>
          )}
          {ctaText && (
            <div className={cn(
              "w-full flex justify-center items-center",
              isBottomOverlay ? "mb-4" : "mt-2"
            )}>
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