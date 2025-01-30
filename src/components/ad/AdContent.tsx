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

  return (
    <div className="flex-1 flex items-center justify-center px-4 w-full">
      <div className="flex flex-col items-center justify-center w-full h-full p-4 box-border">
        <div className="w-full flex flex-col items-center justify-center gap-2">
          {headline && (
            <h2 
              className={cn(
                "text-center leading-tight break-words max-w-[90%]",
                templateStyle === 'minimal' ? 'text-black' : 'text-white'
              )}
              style={textStyle}
            >
              {headline}
            </h2>
          )}
          {ctaText && (
            <div className="w-full flex justify-center items-center mt-2">
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