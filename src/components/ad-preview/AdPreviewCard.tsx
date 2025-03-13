
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { AdPreviewContent } from "./AdPreviewContent";
import { ImageGenerator } from "@/utils/ImageGenerator";

interface AdPreviewCardProps {
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

interface Position {
  x: number;
  y: number;
}

export function AdPreviewCard({
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
}: AdPreviewCardProps) {
  const [isCapturing, setIsCapturing] = React.useState(false);
  const imageGenerator = React.useRef<ImageGenerator>();

  React.useEffect(() => {
    if (!imageGenerator.current) {
      imageGenerator.current = new ImageGenerator('.ad-content');
    }
  }, []);

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

  return (
    <Card className="h-fit w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Preview</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          className="flex items-center gap-2"
          disabled={isCapturing || isGenerating}
        >
          <Download className="h-4 w-4" />
          {isCapturing ? 'Generating...' : 'Download Preview'}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full">
          <AdPreviewContent
            imageUrl={imageUrl}
            width={width}
            height={height}
            headline={headline}
            description={description}
            descriptionColor={descriptionColor}
            ctaText={ctaText}
            templateStyle={templateStyle}
            accentColor={accentColor}
            ctaColor={ctaColor}
            overlayColor={overlayColor}
            textColor={textColor}
            fontUrl={fontUrl}
            overlayOpacity={overlayOpacity}
            imageUrls={imageUrls}
            currentIndex={currentIndex}
            onPrevious={onPrevious}
            onNext={onNext}
            headlinePosition={headlinePosition}
            descriptionPosition={descriptionPosition}
            ctaPosition={ctaPosition}
            imagePosition={imagePosition}
            showCtaArrow={showCtaArrow}
            language={language}
            onImageLoaded={onImageLoaded}
            fastRenderMode={fastRenderMode}
            preloadedImage={preloadedImage}
            isGenerating={isGenerating}
          />
        </div>
      </CardContent>
    </Card>
  );
}
