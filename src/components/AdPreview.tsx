
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { AdGradient } from "./ad/AdGradient";
import { getTextStyle } from "./ad/AdText";
import { getButtonStyle } from "./ad/AdButton";
import { AdNavigationControls } from "./ad/AdNavigationControls";
import { AdContent } from "./ad/AdContent";
import { AdPreviewImage } from "./ad/AdPreviewImage";
import html2canvas from 'html2canvas';
import { Button } from "./ui/button";
import { Download } from "lucide-react";

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
}: AdPreviewProps) {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [fontFamily, setFontFamily] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);

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

  const handleDownload = async () => {
    const previewElement = document.querySelector('.ad-content');
    if (!previewElement) return;

    try {
      setIsCapturing(true);

      // Wait for a frame to ensure capturing class is applied
      await new Promise(resolve => requestAnimationFrame(resolve));

      const canvas = await html2canvas(previewElement as HTMLElement, {
        useCORS: true,          // Allow cross-origin images
        allowTaint: true,       // Allow loading of cross-origin images
        backgroundColor: null,   // Transparent background
        scale: 1,               // Changed from 4 to 1
        logging: false,
        width: width,           // Use explicit dimensions
        height: height,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.ad-content');
          if (clonedElement) {
            clonedElement.classList.add('capturing');
          }
        }
      });

      // Create and trigger download
      const link = document.createElement('a');
      link.download = 'ad-preview.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
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
    fontFamily 
  });

  const descriptionStyle = getTextStyle({
    style: templateStyle,
    accentColor: overlayColor,
    textColor: descriptionColor,
    fontFamily,
    isDescription: true
  });
  
  const buttonStyle = getButtonStyle({ 
    style: templateStyle, 
    accentColor: ctaColor, 
    isHovered: isButtonHovered, 
    fontFamily 
  });

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
      <CardContent className="flex justify-center p-4">
        <div className="relative w-full max-w-[600px]">
          <div
            className={`ad-content relative overflow-hidden rounded-lg shadow-2xl ${isCapturing ? 'capturing' : ''}`}
            style={{
              aspectRatio: `${width} / ${height}`,
              width: '100%',
            }}
          >
            <AdPreviewImage
              imageUrl={imageUrl}
              position={imagePosition}
              onPositionChange={() => {}}
            />
            <div
              className="absolute inset-0 flex flex-col justify-between pointer-events-none"
              style={gradientStyle}
            >
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
              />
            </div>
          </div>
          {imageUrls.length > 1 && (
            <AdNavigationControls
              onPrevious={onPrevious!}
              onNext={onNext!}
              currentIndex={currentIndex}
              totalImages={imageUrls.length}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
