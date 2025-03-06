
import React from "react";
import { cn } from "@/lib/utils";
import { AdHeadline } from "./AdHeadline";
import { AdDescription } from "./AdDescription";
import { AdCallToAction } from "./AdCallToAction";

interface Position {
  x: number;
  y: number;
}

interface AdContentProps {
  headline?: string;
  description?: string;
  descriptionStyle?: any;
  ctaText?: string;
  textStyle: any;
  buttonStyle: any;
  templateStyle?: string;
  isButtonHovered: boolean;
  onButtonHover: (isHovered: boolean) => void;
  headlinePosition: Position;
  descriptionPosition: Position;
  ctaPosition: Position;
  showCtaArrow?: boolean;
  isRTL?: boolean;
}

export function AdContent({
  headline = "Piano in Paradise",
  description = "Discover the perfect harmony of music and nature",
  descriptionStyle,
  ctaText = "Experience Nature's Symphony",
  textStyle,
  buttonStyle,
  templateStyle = "modern", // Provide default value
  isButtonHovered,
  onButtonHover,
  headlinePosition,
  descriptionPosition,
  ctaPosition,
  showCtaArrow = true,
  isRTL = false,
}: AdContentProps) {
  // Safely check template style
  const safeTemplateStyle = templateStyle || "modern";
  const isBottomOverlay = safeTemplateStyle.startsWith('overlay-bottom-');

  // Ensure textStyle and descriptionStyle have proper direction
  const headlineTextStyle = {
    ...textStyle,
    direction: isRTL ? 'rtl' : 'ltr',
  };
  
  const updatedDescriptionStyle = {
    ...descriptionStyle,
    direction: isRTL ? 'rtl' : 'ltr',
  };

  return (
    <div 
      className="absolute inset-0 flex flex-col"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className={cn(
        "relative flex-1 flex flex-col items-center justify-center gap-4 p-4",
        isBottomOverlay ? "justify-end" : "justify-center"
      )}>
        <div className={cn(
          "relative w-full flex flex-col min-h-[300px] max-w-[90%] mx-auto",
          isBottomOverlay && "bg-gradient-to-t from-black/80 to-transparent"
        )}>
          <AdHeadline
            headline={headline}
            textStyle={headlineTextStyle}
            position={headlinePosition}
          />
          
          <AdDescription
            description={description}
            descriptionStyle={updatedDescriptionStyle}
            position={descriptionPosition}
          />
          
          <AdCallToAction
            ctaText={ctaText}
            buttonStyle={buttonStyle}
            position={ctaPosition}
            isButtonHovered={isButtonHovered}
            onButtonHover={onButtonHover}
            showArrow={showCtaArrow}
          />
        </div>
      </div>
    </div>
  );
}
