import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { AdGradient } from "./ad/AdGradient";
import { getTextStyle } from "./ad/AdText";
import { getButtonStyle } from "./ad/AdButton";

interface AdPreviewProps {
  imageUrl?: string;
  width: number;
  height: number;
  headline?: string;
  ctaText?: string;
  templateStyle?: string;
  accentColor?: string;
  fontUrl?: string;
}

export function AdPreview({ 
  imageUrl, 
  width, 
  height, 
  headline, 
  ctaText, 
  templateStyle,
  accentColor = "#4A90E2",
  fontUrl
}: AdPreviewProps) {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [fontFamily, setFontFamily] = useState<string>('');
  const [isImageLoaded, setIsImageLoaded] = useState(false);

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

        document.fonts.ready.then(() => {
          console.log(`Font ${family} loaded successfully`);
        }).catch(err => {
          console.error(`Error loading font ${family}:`, err);
        });

        return () => {
          document.head.removeChild(link);
        };
      }
    }
  }, [fontUrl]);

  const gradientStyle = AdGradient({ style: templateStyle, color: accentColor });
  const textStyle = getTextStyle({ style: templateStyle, accentColor, fontFamily });
  const buttonStyle = getButtonStyle({ style: templateStyle, accentColor, isHovered: isButtonHovered, fontFamily });

  const aspectRatio = `${width} / ${height}`;

  const handleImageLoad = () => {
    setIsImageLoaded(true);
    console.log('Image loaded successfully');
  };

  return (
    <Card className="h-fit w-full">
      <CardHeader>
        <CardTitle className="text-right">תצוגה מקדימה</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center p-4">
        <div className="relative w-full max-w-[600px]">
          <div
            className="ad-content relative overflow-hidden rounded-lg shadow-2xl"
            style={{
              aspectRatio,
              width: '100%',
            }}
          >
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Ad preview"
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
                  isImageLoaded ? "opacity-100" : "opacity-0"
                )}
                crossOrigin="anonymous"
                onLoad={handleImageLoad}
              />
            )}
            <div
              className="absolute inset-0"
              style={gradientStyle}
            />
            {headline && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6">
                <h2 
                  className={cn(
                    "mb-4 max-w-[80%] text-center break-words",
                    templateStyle === 'minimal' ? 'text-black' : 'text-white'
                  )}
                  style={textStyle}
                >
                  {headline}
                </h2>
                {ctaText && (
                  <button 
                    className="relative z-20 transform px-6 py-3 max-w-[80%] mt-4"
                    style={buttonStyle}
                    onMouseEnter={() => setIsButtonHovered(true)}
                    onMouseLeave={() => setIsButtonHovered(false)}
                  >
                    <span className="block whitespace-normal break-words text-center">
                      {ctaText}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}