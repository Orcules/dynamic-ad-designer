import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { AdGradient } from "./ad/AdGradient";
import { getTextStyle } from "./ad/AdText";
import { getButtonStyle } from "./ad/AdButton";
import { ArrowBigDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface AdPreviewProps {
  imageUrl?: string;
  width: number;
  height: number;
  headline?: string;
  ctaText?: string;
  templateStyle?: string;
  accentColor?: string;
  ctaColor?: string;
  overlayColor?: string;
  fontUrl?: string;
  overlayOpacity?: number;
  imageUrls?: string[];
}

export function AdPreview({ 
  imageUrl, 
  width, 
  height, 
  headline, 
  ctaText, 
  templateStyle,
  accentColor = "#4A90E2",
  ctaColor = "#4A90E2",
  overlayColor = "#000000",
  fontUrl,
  overlayOpacity = 0.4,
  imageUrls = [],
}: AdPreviewProps) {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [fontFamily, setFontFamily] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allImages = [...(imageUrl ? [imageUrl] : []), ...imageUrls].filter(Boolean);
  
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    if (fontUrl) {
      const familyMatch = fontUrl.match(/family=([^:&]+)/);
      if (familyMatch && familyMatch[1]) {
        const family = familyMatch[1].replace(/\+/g, ' ');
        setFontFamily(family);

        const link = document.createElement('link');
        link.href = fontUrl;
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        return () => {
          document.head.removeChild(link);
        };
      }
    }
  }, [fontUrl]);

  const gradientStyle = AdGradient({ 
    style: templateStyle, 
    color: overlayColor, 
    opacity: overlayOpacity 
  });
  
  const textStyle = getTextStyle({ 
    style: templateStyle, 
    accentColor: overlayColor, 
    fontFamily 
  });
  
  const buttonStyle = getButtonStyle({ 
    style: templateStyle, 
    accentColor: ctaColor, 
    isHovered: isButtonHovered, 
    fontFamily 
  });

  return (
    <Card className="h-fit w-full">
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center p-4">
        <div className="relative w-full max-w-[600px]">
          <div
            className="ad-content relative overflow-hidden rounded-lg shadow-2xl"
            style={{
              aspectRatio: `${width} / ${height}`,
              width: '100%',
            }}
          >
            {allImages[currentImageIndex] && (
              <img
                src={allImages[currentImageIndex]}
                alt="Ad preview"
                className="absolute inset-0 h-full w-full object-cover"
                crossOrigin="anonymous"
              />
            )}
            <div
              className="absolute inset-0 flex flex-col justify-between"
              style={gradientStyle}
            >
              {headline && (
                <div className="flex-1 flex items-center justify-center px-4 w-full">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', padding: '1rem', boxSizing: 'border-box' }}>
                    <div className="w-full flex flex-col items-center justify-center gap-2">
                      <h2 
                        className={cn(
                          "text-center leading-tight break-words max-w-[90%]",
                          templateStyle === 'minimal' ? 'text-black' : 'text-white'
                        )}
                        style={textStyle}
                      >
                        {headline}
                      </h2>
                      {ctaText && (
                        <div className="w-full flex justify-center items-center mt-2">
                          <div 
                            className="relative transform flex items-center justify-center gap-2 mx-auto"
                            style={buttonStyle}
                            onMouseEnter={() => setIsButtonHovered(true)}
                            onMouseLeave={() => setIsButtonHovered(false)}
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
              )}
            </div>
            {allImages.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white z-10"
                  onClick={handlePrevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white z-10"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                  {allImages.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        currentImageIndex === index ? "bg-white" : "bg-white/50"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}