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

  const isOverlayStyle = templateStyle?.startsWith('overlay-');
  const containerClasses = cn(
    "flex-1 flex items-stretch px-4 w-full",
    isOverlayStyle ? "pointer-events-auto" : ""
  );

  return (
    <div className={containerClasses}>
      <div className="flex flex-col w-full h-full p-4 box-border justify-center">
        <div className={cn(
          "w-full flex flex-col items-center gap-2",
          isOverlayStyle ? "relative" : ""
        )}>
          {headline && (
            <h2 
              className={cn(
                "text-center leading-tight break-words",
                templateStyle === 'minimal' ? 'text-black' : 'text-white',
                isOverlayStyle ? 'w-full' : 'max-w-[90%]'
              )}
              style={textStyle}
            >
              {headline}
            </h2>
          )}
          {ctaText && (
            <div className={cn(
              "w-full flex justify-center items-center mt-2",
              isOverlayStyle ? "absolute -bottom-16" : ""
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