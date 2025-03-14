
import React, { useMemo, useCallback } from "react";
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
  templateStyle = "modern",
  isButtonHovered,
  onButtonHover,
  headlinePosition,
  descriptionPosition,
  ctaPosition,
  showCtaArrow = true,
  isRTL = false,
}: AdContentProps) {
  // Safely check template style with useMemo to prevent unnecessary recalculations
  const safeTemplateStyle = useMemo(() => {
    return templateStyle && templateStyle.trim() ? templateStyle : "modern";
  }, [templateStyle]);
  
  const isBottomOverlay = useMemo(() => {
    return safeTemplateStyle.startsWith('overlay-bottom-');
  }, [safeTemplateStyle]);

  const isLuxuryJewelry = useMemo(() => {
    return safeTemplateStyle === 'luxury-jewelry';
  }, [safeTemplateStyle]);

  // Use useMemo for style objects to prevent unnecessary re-renders and properly handle RTL
  const headlineTextStyle = useMemo(() => {
    return {
      ...textStyle,
      direction: isRTL ? 'rtl' : 'ltr',
      textAlign: isRTL ? 'right' : 'center',
      unicodeBidi: 'embed',
      // Fix for html2canvas rendering - ensure proper text display
      fontSize: textStyle.fontSize,
      fontWeight: textStyle.fontWeight || 'bold',
      lineHeight: textStyle.lineHeight || 1.2,
      maxWidth: '100%',
    };
  }, [textStyle, isRTL]);
  
  const updatedDescriptionStyle = useMemo(() => {
    return {
      ...descriptionStyle,
      direction: isRTL ? 'rtl' : 'ltr',
      textAlign: isRTL ? 'right' : 'center',
      unicodeBidi: 'embed',
      // Fix for html2canvas rendering - ensure proper text display
      fontSize: descriptionStyle?.fontSize,
      fontWeight: descriptionStyle?.fontWeight || 'normal',
      lineHeight: descriptionStyle?.lineHeight || 1.5,
      maxWidth: '100%',
    };
  }, [descriptionStyle, isRTL]);

  // Make sure button hover handler works reliably
  const handleButtonHover = useCallback((isHovered: boolean) => {
    // Use requestAnimationFrame to ensure UI updates smoothly
    requestAnimationFrame(() => {
      onButtonHover(isHovered);
    });
  }, [onButtonHover]);

  // Safe handling of potential placeholder content
  const safeHeadline = headline?.trim() || "Your Headline Here";
  const safeDescription = description?.trim() || "Your description text here";
  const safeCtaText = ctaText?.trim() || "Click Here";

  return (
    <div 
      className="absolute inset-0 flex flex-col pointer-events-auto"
      dir={isRTL ? "rtl" : "ltr"}
      lang={isRTL ? "he" : "en"} // Add language attribute for better RTL handling
    >
      <div className={cn(
        "relative flex-1 flex flex-col items-center justify-center gap-4 p-4",
        isBottomOverlay ? "justify-end" : "justify-center"
      )}>
        {isLuxuryJewelry ? (
          <div className="relative w-full h-full flex flex-col items-center justify-between py-8">
            {/* Top text section */}
            <div className="text-center z-10 mt-4" style={{ 
              // Fix RTL rendering in html2canvas
              direction: isRTL ? 'rtl' : 'ltr',
              textAlign: isRTL ? 'right' : 'center'
            }}>
              <AdHeadline
                headline={safeHeadline}
                textStyle={headlineTextStyle}
                position={headlinePosition}
              />
              
              <AdDescription
                description={safeDescription}
                descriptionStyle={updatedDescriptionStyle}
                position={descriptionPosition}
              />
            </div>
            
            {/* Bottom CTA section */}
            <div className="z-10 mb-4">
              <AdCallToAction
                ctaText={safeCtaText}
                buttonStyle={buttonStyle}
                position={ctaPosition}
                isButtonHovered={isButtonHovered}
                onButtonHover={handleButtonHover}
                showArrow={false}
              />
            </div>
          </div>
        ) : (
          <div className={cn(
            "relative w-full flex flex-col min-h-[300px] max-w-[90%] mx-auto",
            isBottomOverlay && "bg-gradient-to-t from-black/80 to-transparent",
          )}
          style={{
            // Fix RTL rendering in html2canvas
            direction: isRTL ? 'rtl' : 'ltr',
            textAlign: isRTL ? 'right' : 'center'
          }}>
            <AdHeadline
              headline={safeHeadline}
              textStyle={headlineTextStyle}
              position={headlinePosition}
            />
            
            <AdDescription
              description={safeDescription}
              descriptionStyle={updatedDescriptionStyle}
              position={descriptionPosition}
            />
            
            <AdCallToAction
              ctaText={safeCtaText}
              buttonStyle={buttonStyle}
              position={ctaPosition}
              isButtonHovered={isButtonHovered}
              onButtonHover={handleButtonHover}
              showArrow={showCtaArrow}
            />
          </div>
        )}
      </div>
    </div>
  );
}
