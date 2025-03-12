import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { AdGradient } from "./ad/AdGradient";
import { getTextStyle } from "./ad/AdText";
import { getButtonStyle } from "./ad/AdButton";
import { AdNavigationControls } from "./ad/AdNavigationControls";
import { AdContent } from "./ad/AdContent";
import { AdPreviewImage } from "./ad/AdPreviewImage";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { ImageGenerator } from "@/utils/ImageGenerator";

interface Position {
  x: number;
  y: number;
}

interface AdPreviewProps {
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
}

export function AdPreview({ 
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
}: AdPreviewProps) {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [fontFamily, setFontFamily] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const imageGenerator = useRef<ImageGenerator>();
  const isRTL = language === 'he' || language === 'ar';
  const currentImageUrl = useRef<string | undefined>(imageUrl);
  const fontLoaded = useRef<boolean>(false);
  const fontLoadAttempts = useRef<number>(0);
  const preloadedImages = useRef<Set<string>>(new Set());
  
  const isLuxuryJewelry = templateStyle === 'luxury-jewelry';

  useEffect(() => {
    if (!imageGenerator.current) {
      imageGenerator.current = new ImageGenerator('.ad-content');
    }
  }, []);

  useEffect(() => {
    if (imageUrl !== currentImageUrl.current) {
      console.log(`AdPreview detected image URL change: ${currentImageUrl.current} → ${imageUrl}`);
      currentImageUrl.current = imageUrl;
    }
  }, [imageUrl]);

  useEffect(() => {
    if (imageUrls.length > 0) {
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
  }, [imageUrls, currentIndex]);

  useEffect(() => {
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
        console.log(`Font loaded in AdPreview: ${family}`);
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
    if (fastRenderMode) {
      setTimeout(() => {
        if (onImageLoaded) onImageLoaded();
      }, 50);
    } else {
      console.log('Image loaded callback in AdPreview');
      if (onImageLoaded) {
        onImageLoaded();
      }
    }
  };

  const handleDownload = async () => {
    if (!imageGenerator.current) return;

    try {
      setIsCapturing(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      await imageGenerator.current.downloadImage('ad-preview.png');
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsCapturing(false);
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

  const handlePrevious = () => {
    if (onPrevious && typeof onPrevious === 'function') {
      onPrevious();
    }
  };

  const handleNext = () => {
    if (onNext && typeof onNext === 'function') {
      onNext();
    }
  };

  if (fastRenderMode) {
    return (
      <div 
        className="ad-content relative overflow-hidden bg-black"
        style={{
          aspectRatio: `${width} / ${height}`,
          width: '100%',
        }}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className={cn(
          "relative w-full h-full",
          isLuxuryJewelry && "p-4"
        )}>
          <div className={cn(
            "relative w-full h-full",
            isLuxuryJewelry && "rounded-[2rem] overflow-hidden"
          )}>
            <AdPreviewImage
              imageUrl={imageUrl}
              position={imagePosition}
              onPositionChange={() => {}}
              onImageLoaded={handleImageLoaded}
              fastMode={true}
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
              templateStyle={templateStyle}
              isButtonHovered={isButtonHovered}
              onButtonHover={setIsButtonHovered}
              headlinePosition={headlinePosition}
              descriptionPosition={descriptionPosition}
              ctaPosition={ctaPosition}
              showCtaArrow={showCtaArrow}
              isRTL={isRTL}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="h-fit w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Preview</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          className="flex items-center gap-2"
          disabled={isCapturing}
        >
          <Download className="h-4 w-4" />
          {isCapturing ? 'Generating...' : 'Download Preview'}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full">
          <div
            className="ad-content relative overflow-hidden bg-black"
            style={{
              aspectRatio: `${width} / ${height}`,
              width: '100%',
            }}
            dir={isRTL ? "rtl" : "ltr"}
          >
            <div className={cn(
              "relative w-full h-full",
              isLuxuryJewelry && "p-4"
            )}>
              <div className={cn(
                "relative w-full h-full",
                isLuxuryJewelry && "rounded-[2rem] overflow-hidden"
              )}>
                <AdPreviewImage
                  imageUrl={imageUrl}
                  position={imagePosition}
                  onPositionChange={() => {}}
                  onImageLoaded={handleImageLoaded}
                  fastMode={fastRenderMode}
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
                  templateStyle={templateStyle}
                  isButtonHovered={isButtonHovered}
                  onButtonHover={setIsButtonHovered}
                  headlinePosition={headlinePosition}
                  descriptionPosition={descriptionPosition}
                  ctaPosition={ctaPosition}
                  showCtaArrow={showCtaArrow}
                  isRTL={isRTL}
                />
              </div>
            </div>
          </div>
          {imageUrls.length > 1 && (
            <AdNavigationControls
              onPrevious={handlePrevious}
              onNext={handleNext}
              currentIndex={currentIndex}
              totalImages={imageUrls.length}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
