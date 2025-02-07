import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { AdHeadline } from "./AdHeadline";
import { AdDescription } from "./AdDescription";
import { AdCallToAction } from "./AdCallToAction";

interface Position {
  x: number;
  y: number;
}

interface AdContentProps {
  headline?: string;
  description?: string;
  descriptionStyle?: any;
  ctaText?: string;
  textStyle: any;
  buttonStyle: any;
  templateStyle?: string;
  isButtonHovered: boolean;
  onButtonHover: (isHovered: boolean) => void;
}

export function AdContent({
  headline,
  description,
  descriptionStyle,
  ctaText,
  textStyle,
  buttonStyle,
  templateStyle,
  isButtonHovered,
  onButtonHover,
}: AdContentProps) {
  const [headlinePos, setHeadlinePos] = useState<Position>({ x: 0, y: 0 });
  const [descriptionPos, setDescriptionPos] = useState<Position>({ x: 0, y: 0 });
  const [ctaPos, setCtaPos] = useState<Position>({ x: 0, y: 0 });
  const [isDraggingHeadline, setIsDraggingHeadline] = useState(false);
  const [isDraggingDescription, setIsDraggingDescription] = useState(false);
  const [isDraggingCta, setIsDraggingCta] = useState(false);
  const dragStartPos = useRef<Position>({ x: 0, y: 0 });
  const elementStartPos = useRef<Position>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, type: 'headline' | 'description' | 'cta') => {
    e.preventDefault();
    const setIsDragging = type === 'headline' 
      ? setIsDraggingHeadline 
      : type === 'description'
      ? setIsDraggingDescription
      : setIsDraggingCta;
    const currentPos = type === 'headline' 
      ? headlinePos 
      : type === 'description'
      ? descriptionPos
      : ctaPos;
    
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = currentPos;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingHeadline && !isDraggingDescription && !isDraggingCta) return;

    e.preventDefault();
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;

    if (isDraggingHeadline) {
      setHeadlinePos({
        x: elementStartPos.current.x + dx,
        y: elementStartPos.current.y + dy,
      });
    }

    if (isDraggingDescription) {
      setDescriptionPos({
        x: elementStartPos.current.x + dx,
        y: elementStartPos.current.y + dy,
      });
    }

    if (isDraggingCta) {
      setCtaPos({
        x: elementStartPos.current.x + dx,
        y: elementStartPos.current.y + dy,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingHeadline(false);
    setIsDraggingDescription(false);
    setIsDraggingCta(false);
  };

  const isBottomOverlay = templateStyle?.startsWith('overlay-bottom-');

  return (
    <div 
      className="absolute inset-0 flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className={cn(
        "relative flex-1 flex flex-col items-center justify-center gap-4 p-4",
        isBottomOverlay ? "justify-end" : "justify-center"
      )}>
        <div className={cn(
          "relative w-full flex flex-col min-h-[300px] max-w-[90%] mx-auto",
          isBottomOverlay && "bg-gradient-to-t from-black/80 to-transparent"
        )}>
          <AdHeadline
            headline={headline}
            textStyle={textStyle}
            isDragging={isDraggingHeadline}
            position={headlinePos}
            onMouseDown={(e) => handleMouseDown(e, 'headline')}
          />
          
          <AdDescription
            description={description}
            descriptionStyle={descriptionStyle}
            isDragging={isDraggingDescription}
            position={descriptionPos}
            onMouseDown={(e) => handleMouseDown(e, 'description')}
          />
          
          <AdCallToAction
            ctaText={ctaText}
            buttonStyle={buttonStyle}
            isDragging={isDraggingCta}
            position={ctaPos}
            onMouseDown={(e) => handleMouseDown(e, 'cta')}
            isButtonHovered={isButtonHovered}
            onButtonHover={onButtonHover}
          />
        </div>
      </div>
    </div>
  );
}