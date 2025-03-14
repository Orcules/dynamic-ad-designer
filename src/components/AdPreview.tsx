
import { AdPreviewCard } from "./ad-preview/AdPreviewCard";
import React from "react";

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
  preloadedImage?: HTMLImageElement | null;
  isGenerating?: boolean;
}

export function AdPreview(props: AdPreviewProps) {
  // Memoize the component to prevent unnecessary re-renders
  return React.useMemo(() => {
    return <AdPreviewCard {...props} />;
  }, [
    props.imageUrl,
    props.width,
    props.height,
    props.headline,
    props.description,
    props.ctaText,
    props.templateStyle,
    props.currentIndex,
    props.isGenerating,
    // Note: Positions are intentionally not included in the dependency array 
    // to avoid re-rendering when dragging, which would slow performance
  ]);
}
