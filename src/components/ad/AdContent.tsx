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

  // Different layout configurations based on template style
  const getContentLayout = () => {
    switch (templateStyle) {
      case 'modern':
      case 'elegant':
      case 'spotlight':
        return 'justify-center'; // Center everything
      case 'dynamic':
      case 'wave':
      case 'cinematic':
        return 'justify-end'; // Everything at bottom
      case 'minimal-fade':
      case 'duotone':
      case 'vignette':
        return 'justify-between py-8'; // Headline top, CTA bottom
      case 'luxury':
        return 'justify-start'; // Everything at top
      default:
        return 'justify-center';
    }
  };

  const getHeadlinePosition = () => {
    switch (templateStyle) {
      case 'modern':
      case 'elegant':
      case 'spotlight':
        return 'text-center';
      case 'dynamic':
      case 'wave':
        return 'text-left';
      case 'cinematic':
      case 'luxury':
        return 'text-right';
      default:
        return 'text-center';
    }
  };

  return (
    <div className="flex-1 flex items-stretch px-4 w-full">
      <div className={cn(
        "flex flex-col w-full h-full p-4 box-border",
        getContentLayout()
      )}>
        <div className="w-full flex flex-col items-center gap-2">
          {headline && (
            <h2 
              className={cn(
                "leading-tight break-words max-w-[90%]",
                getHeadlinePosition(),
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