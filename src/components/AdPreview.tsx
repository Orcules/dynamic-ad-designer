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

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-right">תצוגה מקדימה</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="w-full relative rounded-lg overflow-hidden shadow-2xl"
          style={{
            aspectRatio: `${width}/${height}`,
          }}
        >
          <div className="ad-content absolute inset-0 flex flex-col items-center justify-center">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Ad preview"
                className="absolute inset-0 w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            )}
            <div
              className="absolute inset-0"
              style={gradientStyle}
            />
            {headline && (
              <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center w-full h-full">
                <h2 
                  className={cn(
                    "mb-6 max-w-[90%]",
                    templateStyle === 'minimal' ? 'text-black' : 'text-white'
                  )}
                  style={textStyle}
                >
                  {headline}
                </h2>
                {ctaText && (
                  <button 
                    className="relative z-10 transform px-4 py-2 max-w-[90%]"
                    style={buttonStyle}
                    onMouseEnter={() => setIsButtonHovered(true)}
                    onMouseLeave={() => setIsButtonHovered(false)}
                  >
                    <span className="block">
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