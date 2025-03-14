
import React, { useState, useCallback } from "react";
import { AdGradient } from "../ad/AdGradient";
import { getTextStyle } from "../ad/AdText";
import { getButtonStyle } from "../ad/AdButton";
import { useAdPreviewFont } from "@/hooks/useAdPreviewFont";
import { useAdPreviewImage } from "@/hooks/useAdPreviewImage";
import { LuxuryJewelryTemplate } from "./LuxuryJewelryTemplate";
import { StandardTemplate } from "./StandardTemplate";

interface Position {
  x: number;
  y: number;
}

export interface AdPreviewControllerProps {
  imageUrl?: string;
  width: number;
  height: number;
  headline?: string;
  description?: string;
  descriptionColor?: string;
  ctaText?: string;
  templateStyle?: string;
  accentColor?: string;
  ctaColor?: string;
  overlayColor?: string;
  textColor?: string;
  fontUrl?: string;
  overlayOpacity?: number;
  imageUrls?: string[];
  currentIndex?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  headlinePosition: Position;
  descriptionPosition: Position;
  ctaPosition: Position;
  imagePosition: Position;
  showCtaArrow?: boolean;
  language?: string;
  onImageLoaded?: () => void;
  fastRenderMode?: boolean;
  preloadedImage?: HTMLImageElement | null;
  isGenerating?: boolean;
}

export function AdPreviewController({
  imageUrl,
  width,
  height,
  headline,
  description,
  descriptionColor = "#333333",
  ctaText,
  templateStyle,
  accentColor = "#4A90E2",
  ctaColor = "#4A90E2",
  overlayColor = "#000000",
  textColor = "#FFFFFF",
  fontUrl,
  overlayOpacity = 0.4,
  imageUrls = [],
  currentIndex = 0,
  onPrevious,
  onNext,
  headlinePosition,
  descriptionPosition,
  ctaPosition,
  imagePosition,
  showCtaArrow = true,
  language = "en",
  onImageLoaded,
  fastRenderMode = false,
  preloadedImage = null,
  isGenerating = false
}: AdPreviewControllerProps) {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const fontFamily = useAdPreviewFont(fontUrl);
  const { updateImageUrl, getLoadTime } = useAdPreviewImage({ 
    imageUrls, 
    currentIndex 
  });

  React.useEffect(() => {
    updateImageUrl(imageUrl);
  }, [imageUrl, updateImageUrl]);
  
  const isLuxuryJewelry = templateStyle === 'luxury-jewelry';
  const isRTL = language === 'he' || language === 'ar';

  const handleImageLoaded = useCallback(() => {
    const renderTime = getLoadTime();
    console.log(`Image render completed in ${renderTime.toFixed(2)}ms`);
    
    if (onImageLoaded) {
      try {
        onImageLoaded();
      } catch (callbackError) {
        console.error('Error in onImageLoaded callback:', callbackError);
      }
    }
  }, [onImageLoaded, getLoadTime]);

  const handlePrevious = useCallback(() => {
    if (onPrevious && typeof onPrevious === 'function' && !isGenerating) {
      onPrevious();
    }
  }, [onPrevious, isGenerating]);

  const handleNext = useCallback(() => {
    if (onNext && typeof onNext === 'function' && !isGenerating) {
      onNext();
    }
  }, [onNext, isGenerating]);

  const gradientStyle = AdGradient({ 
    style: templateStyle, 
    color: overlayColor, 
    opacity: overlayOpacity 
  });
  
  const textStyle = getTextStyle({ 
    style: templateStyle, 
    accentColor: overlayColor, 
    textColor: textColor,
    fontFamily,
    isRTL
  });

  const descriptionStyle = getTextStyle({
    style: templateStyle,
    accentColor: overlayColor,
    textColor: descriptionColor,
    fontFamily,
    isDescription: true,
    isRTL
  });
  
  const buttonStyle = getButtonStyle({ 
    style: templateStyle, 
    accentColor: ctaColor, 
    isHovered: isButtonHovered, 
    fontFamily 
  });

  if (isLuxuryJewelry) {
    return (
      <LuxuryJewelryTemplate
        width={width}
        height={height}
        imageUrl={imageUrl}
        headline={headline}
        description={description}
        ctaText={ctaText}
        textStyle={textStyle}
        descriptionStyle={descriptionStyle}
        buttonStyle={buttonStyle}
        imageUrls={imageUrls}
        currentIndex={currentIndex}
        onPrevious={handlePrevious}
        onNext={handleNext}
        headlinePosition={headlinePosition}
        descriptionPosition={descriptionPosition}
        ctaPosition={ctaPosition}
        imagePosition={imagePosition}
        isButtonHovered={isButtonHovered}
        onButtonHover={setIsButtonHovered}
        showCtaArrow={showCtaArrow}
        isRTL={isRTL}
        onImageLoaded={handleImageLoaded}
        fastRenderMode={fastRenderMode}
        preloadedImage={preloadedImage}
        isGenerating={isGenerating}
      />
    );
  }

  return (
    <StandardTemplate
      width={width}
      height={height}
      imageUrl={imageUrl}
      headline={headline}
      description={description}
      ctaText={ctaText}
      textStyle={textStyle}
      descriptionStyle={descriptionStyle}
      buttonStyle={buttonStyle}
      gradientStyle={gradientStyle}
      imageUrls={imageUrls}
      currentIndex={currentIndex}
      onPrevious={handlePrevious}
      onNext={handleNext}
      headlinePosition={headlinePosition}
      descriptionPosition={descriptionPosition}
      ctaPosition={ctaPosition}
      imagePosition={imagePosition}
      isButtonHovered={isButtonHovered}
      onButtonHover={setIsButtonHovered}
      showCtaArrow={showCtaArrow}
      isRTL={isRTL}
      onImageLoaded={handleImageLoaded}
      fastRenderMode={fastRenderMode}
      preloadedImage={preloadedImage}
      isGenerating={isGenerating}
    />
  );
}
