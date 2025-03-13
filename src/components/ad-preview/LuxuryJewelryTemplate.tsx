
import React from "react";
import { AdPreviewImage } from "../ad/AdPreviewImage";
import { AdContent } from "../ad/AdContent";
import { AdNavigationControls } from "../ad/AdNavigationControls";

interface Position {
  x: number;
  y: number;
}

interface LuxuryJewelryTemplateProps {
  width: number;
  height: number;
  imageUrl?: string;
  headline?: string;
  description?: string;
  ctaText?: string;
  textStyle: any;
  descriptionStyle: any;
  buttonStyle: any;
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

export function LuxuryJewelryTemplate({
  width,
  height,
  imageUrl,
  headline,
  description,
  ctaText,
  textStyle,
  descriptionStyle,
  buttonStyle,
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
}: LuxuryJewelryTemplateProps) {
  const luxuryBgColor = "#c5022e";

  return (
    <div 
      className="ad-content relative overflow-hidden group"
      style={{
        aspectRatio: `${width} / ${height}`,
        width: '100%',
        backgroundColor: luxuryBgColor,
        backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)",
        backgroundSize: "40px 40px",
      }}
      dir={isRTL ? "rtl" : "ltr"}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      <div className="relative w-full h-full p-6">
        <div className="absolute inset-0 m-auto w-[80%] h-[50%] rounded-[2rem] overflow-hidden border-4 border-[#f8e9b0] shadow-lg">
          <AdPreviewImage
            imageUrl={imageUrl}
            position={imagePosition}
            onPositionChange={() => {}}
            onImageLoaded={onImageLoaded}
            fastMode={fastRenderMode}
            preloadedImage={preloadedImage}
          />
        </div>
        <AdContent
          headline={headline}
          description={description}
          descriptionStyle={descriptionStyle}
          ctaText={ctaText}
          textStyle={textStyle}
          buttonStyle={buttonStyle}
          templateStyle="luxury-jewelry"
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
  );
}
