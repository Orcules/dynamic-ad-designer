
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
  onHeadlinePositionChange?: (position: Position) => void;
  onDescriptionPositionChange?: (position: Position) => void;
  onCtaPositionChange?: (position: Position) => void;
}

export function AdContent({
  headline,
  description,
  descriptionStyle,
  ctaText,
  textStyle,
  buttonStyle,
  templateStyle,
  isButtonHovered,
  onButtonHover,
  headlinePosition,
  descriptionPosition,
  ctaPosition,
  showCtaArrow = true,
  onHeadlinePositionChange,
  onDescriptionPositionChange,
  onCtaPositionChange,
}: AdContentProps) {
  const isBottomOverlay = templateStyle?.startsWith('overlay-bottom-');

  return (
    <div 
      className="absolute inset-0 flex flex-col"
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
            textStyle={textStyle}
            position={headlinePosition}
            onPositionChange={onHeadlinePositionChange}
          />
          
          <AdDescription
            description={description}
            descriptionStyle={descriptionStyle}
            position={descriptionPosition}
            onPositionChange={onDescriptionPositionChange}
          />
          
          <AdCallToAction
            ctaText={ctaText}
            buttonStyle={buttonStyle}
            position={ctaPosition}
            isButtonHovered={isButtonHovered}
            onButtonHover={onButtonHover}
            showArrow={showCtaArrow}
            onPositionChange={onCtaPositionChange}
          />
        </div>
      </div>
    </div>
  );
}
