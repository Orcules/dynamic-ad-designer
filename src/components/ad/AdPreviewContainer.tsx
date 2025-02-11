
import { AdContent } from "./AdContent";
import { AdPreviewImage } from "./AdPreviewImage";
import { AdNavigationControls } from "./AdNavigationControls";
import { CSSProperties } from "react";

interface Position {
  x: number;
  y: number;
}

interface AdPreviewContainerProps {
  width: number;
  height: number;
  imageUrl?: string;
  imagePosition: Position;
  gradientStyle: CSSProperties;
  headline?: string;
  description?: string;
  descriptionStyle: CSSProperties;
  ctaText?: string;
  textStyle: CSSProperties;
  buttonStyle: CSSProperties;
  templateStyle?: string;
  isButtonHovered: boolean;
  onButtonHover: (isHovered: boolean) => void;
  headlinePosition: Position;
  descriptionPosition: Position;
  ctaPosition: Position;
  showCtaArrow?: boolean;
  isCapturing: boolean;
  imageUrls?: string[];
  currentIndex?: number;
  onPrevious?: () => void;
  onNext?: () => void;
}

export const AdPreviewContainer: React.FC<AdPreviewContainerProps> = ({
  width,
  height,
  imageUrl,
  imagePosition,
  gradientStyle,
  headline,
  description,
  descriptionStyle,
  ctaText,
  textStyle,
  buttonStyle,
  templateStyle,
  isButtonHovered,
  onButtonHover,
  headlinePosition,
  descriptionPosition,
  ctaPosition,
  showCtaArrow,
  isCapturing,
  imageUrls = [],
  currentIndex = 0,
  onPrevious,
  onNext,
}) => {
  return (
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
            onButtonHover={onButtonHover}
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
  );
};
