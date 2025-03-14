
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { AdGradient } from "../ad/AdGradient";
import { getTextStyle } from "../ad/AdText";
import { getButtonStyle } from "../ad/AdButton";
import { AdNavigationControls } from "../ad/AdNavigationControls";
import { AdContent } from "../ad/AdContent";
import { AdPreviewImage } from "../ad/AdPreviewImage";
import { LuxuryJewelryTemplate } from "./LuxuryJewelryTemplate";
import { StandardTemplate } from "./StandardTemplate";

interface Position {
  x: number;
  y: number;
}

interface AdPreviewContentProps {
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

export function AdPreviewContent({
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
}: AdPreviewContentProps) {
  const [isButtonHovered, setIsButtonHovered] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);
  const [fontFamily, setFontFamily] = React.useState<string>('');
  const currentImageUrl = React.useRef<string | undefined>(imageUrl);
  const fontLoaded = React.useRef<boolean>(false);
  const fontLoadAttempts = React.useRef<number>(0);
  const preloadedImages = React.useRef<Set<string>>(new Set());
  const renderStartTime = React.useRef<number>(performance.now());
  
  const isLuxuryJewelry = templateStyle === 'luxury-jewelry';
  const isRTL = language === 'he' || language === 'ar';

  React.useEffect(() => {
    renderStartTime.current = performance.now();
  }, []);

  React.useEffect(() => {
    if (imageUrl !== currentImageUrl.current) {
      console.log(`AdPreviewContent detected image URL change: ${currentImageUrl.current} → ${imageUrl}`);
      currentImageUrl.current = imageUrl;
    }
  }, [imageUrl]);

  React.useEffect(() => {
    if (imageUrls.length <= 1) return;
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const imagesToPreload = [];
        
        if (currentIndex >= 0 && currentIndex < imageUrls.length) {
          imagesToPreload.push(imageUrls[currentIndex]);
        }
        
        if (currentIndex + 1 < imageUrls.length) {
          imagesToPreload.push(imageUrls[currentIndex + 1]);
        }
        
        if (currentIndex - 1 >= 0) {
          imagesToPreload.push(imageUrls[currentIndex - 1]);
        }
        
        imagesToPreload.forEach(url => {
          if (url && !preloadedImages.current.has(url)) {
            const img = new Image();
            img.src = url;
            img.crossOrigin = "anonymous";
            preloadedImages.current.add(url);
          }
        });
      }
    }, { threshold: 0.1 });
    
    const adPreviewElement = document.querySelector('.ad-content');
    if (adPreviewElement) {
      observer.observe(adPreviewElement);
    }
    
    return () => {
      if (adPreviewElement) {
        observer.unobserve(adPreviewElement);
      }
      observer.disconnect();
    };
  }, [imageUrls, currentIndex]);

  React.useEffect(() => {
    if (!fontUrl) return;
    
    const familyMatch = fontUrl.match(/family=([^:&]+)/);
    if (!familyMatch || !familyMatch[1]) return;
    
    const family = familyMatch[1].replace(/\+/g, ' ');
    console.log(`Setting font family to: ${family} from ${fontUrl}`);
    setFontFamily(family);
    
    if (!document.querySelector(`link[href="${fontUrl}"]`)) {
      const link = document.createElement('link');
      link.href = fontUrl;
      link.rel = 'stylesheet';
      link.onload = () => {
        console.log(`Font loaded in AdPreviewContent: ${family}`);
        fontLoaded.current = true;
        
        setFontFamily(prev => prev + ' ');
        setTimeout(() => setFontFamily(family), 10);
      };
      document.head.appendChild(link);
    } else {
      console.log(`Font already in DOM: ${family}`);
      fontLoaded.current = true;
      
      if (fontLoadAttempts.current < 3) {
        fontLoadAttempts.current++;
        setTimeout(() => {
          setFontFamily(prev => prev + ' ');
          setTimeout(() => setFontFamily(family), 10);
        }, 100);
      }
    }
  }, [fontUrl]);

  const handleImageLoaded = () => {
    const renderTime = performance.now() - renderStartTime.current;
    console.log(`Image render completed in ${renderTime.toFixed(2)}ms`);
    
    if (onImageLoaded) {
      try {
        onImageLoaded();
      } catch (callbackError) {
        console.error('Error in onImageLoaded callback:', callbackError);
      }
    }
  };

  const handlePrevious = () => {
    if (onPrevious && typeof onPrevious === 'function' && !isGenerating) {
      onPrevious();
    }
  };

  const handleNext = () => {
    if (onNext && typeof onNext === 'function' && !isGenerating) {
      onNext();
    }
  };

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
