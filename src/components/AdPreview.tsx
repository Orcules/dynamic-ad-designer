import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { AdGradient } from "./ad/AdGradient";
import { getTextStyle } from "./ad/AdText";
import { getButtonStyle } from "./ad/AdButton";
import { ArrowBigDown } from "lucide-react";

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

        return () => {
          document.head.removeChild(link);
        };
      }
    }
  }, [fontUrl]);

  const gradientStyle = AdGradient({ style: templateStyle, color: accentColor });
  const textStyle = getTextStyle({ style: templateStyle, accentColor, fontFamily });
  const buttonStyle = getButtonStyle({ style: templateStyle, accentColor, isHovered: isButtonHovered, fontFamily });

  const containerStyle: React.CSSProperties = templateStyle === 'luxury' ? {
    background: 'rgba(30, 174, 219, 0.3)',
    padding: '2rem',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '2rem',
  } : {};

  const aspectRatio = `${width} / ${height}`;
  const showArrow = ['dynamic', 'spotlight', 'wave', 'modern', 'neon', 'elegant', 'cinematic', 'sunset', 'minimal-fade', 'duotone', 'vignette'].includes(templateStyle || '');

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
              aspectRatio,
              width: '100%',
            }}
          >
            {imageUrl && (
              <img
                src={imageUrl}
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
                  <div style={containerStyle}>
                    <h2 
                      className={cn(
                        "text-center max-w-[90%] leading-tight",
                        templateStyle === 'minimal' ? 'text-black' : 'text-white'
                      )}
                      style={textStyle}
                    >
                      {headline}
                    </h2>
                    {ctaText && (
                      <div className="w-full flex justify-center items-center">
                        <div 
                          className="relative transform flex items-center justify-center gap-2 mx-auto"
                          style={buttonStyle}
                          onMouseEnter={() => setIsButtonHovered(true)}
                          onMouseLeave={() => setIsButtonHovered(false)}
                        >
                          <span className="block">
                            {ctaText}
                          </span>
                          {showArrow && (
                            <ArrowBigDown 
                              className={cn(
                                "w-4 h-4 transition-transform duration-300",
                                isButtonHovered ? "translate-y-1" : ""
                              )}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}