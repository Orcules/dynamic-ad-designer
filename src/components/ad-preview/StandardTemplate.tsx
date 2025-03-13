
import React from "react";
import { cn } from "@/lib/utils";
import { AdPreviewImage } from "../ad/AdPreviewImage";
import { AdContent } from "../ad/AdContent";
import { AdNavigationControls } from "../ad/AdNavigationControls";

interface Position {
  x: number;
  y: number;
}

interface StandardTemplateProps {
  width: number;
  height: number;
  imageUrl?: string;
  headline?: string;
  description?: string;
  ctaText?: string;
  textStyle: any;
  descriptionStyle: any;
  buttonStyle: any;
  gradientStyle: any;
  imageUrls: string[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  headlinePosition: Position;
  descriptionPosition: Position;
  ctaPosition: Position;
  imagePosition: Position;
  isButtonHovered: boolean;
  onButtonHover: (isHovered: boolean) => void;
  showCtaArrow: boolean;
  isRTL: boolean;
  onImageLoaded?: () => void;
  fastRenderMode?: boolean;
  preloadedImage?: HTMLImageElement | null;
  isGenerating?: boolean;
}

export function StandardTemplate({
  width,
  height,
  imageUrl,
  headline,
  description,
  ctaText,
  textStyle,
  descriptionStyle,
  buttonStyle,
  gradientStyle,
  imageUrls,
  currentIndex,
  onPrevious,
  onNext,
  headlinePosition,
  descriptionPosition,
  ctaPosition,
  imagePosition,
  isButtonHovered,
  onButtonHover,
  showCtaArrow,
  isRTL,
  onImageLoaded,
  fastRenderMode = false,
  preloadedImage = null,
  isGenerating = false
}: StandardTemplateProps) {
  return (
    <div 
      className="ad-content relative overflow-hidden group bg-black"
      style={{
        aspectRatio: `${width} / ${height}`,
        width: '100%',
      }}
      dir={isRTL ? "rtl" : "ltr"}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      <div className="relative w-full h-full">
        <div className="relative w-full h-full">
          <AdPreviewImage
            imageUrl={imageUrl}
            position={imagePosition}
            onPositionChange={() => {}}
            onImageLoaded={onImageLoaded}
            fastMode={fastRenderMode}
            preloadedImage={preloadedImage}
          />
          <div
            className="absolute inset-0"
            style={gradientStyle}
          />
          <AdContent
            headline={headline}
            description={description}
            descriptionStyle={descriptionStyle}
            ctaText={ctaText}
            textStyle={textStyle}
            buttonStyle={buttonStyle}
            templateStyle="standard"
            isButtonHovered={isButtonHovered}
            onButtonHover={onButtonHover}
            headlinePosition={headlinePosition}
            descriptionPosition={descriptionPosition}
            ctaPosition={ctaPosition}
            showCtaArrow={showCtaArrow}
            isRTL={isRTL}
          />
        </div>
        
        {imageUrls.length > 1 && (
          <AdNavigationControls
            onPrevious={onPrevious}
            onNext={onNext}
            currentIndex={currentIndex}
            totalImages={imageUrls.length}
            disabled={isGenerating}
          />
        )}
      </div>
    </div>
  );
}
