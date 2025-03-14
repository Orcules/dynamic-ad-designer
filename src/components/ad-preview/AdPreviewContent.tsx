
import React from "react";
import { AdPreviewController } from "./AdPreviewController";

interface Position {
  x: number;
  y: number;
}

interface AdPreviewContentProps {
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

export function AdPreviewContent(props: AdPreviewContentProps) {
  return <AdPreviewController {...props} />;
}
