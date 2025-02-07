import { ArrowBigDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";

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

interface Position {
  x: number;
  y: number;
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
  if (!headline && !description && !ctaText) return null;

  const isBottomOverlay = templateStyle?.startsWith('overlay-bottom-');
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

  return (
    <div 
      className="absolute inset-0 flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className={cn(
        "flex-1 flex flex-col",
        isBottomOverlay ? "justify-end" : "justify-center"
      )}>
        <div className={cn(
          "relative w-full flex flex-col min-h-[300px]",
          isBottomOverlay && "bg-gradient-to-t from-black/80 to-transparent"
        )}>
          {headline && (
            <div 
              className={cn(
                "px-6 mt-12 cursor-move",
                isDraggingHeadline && "select-none"
              )}
              style={{
                transform: `translate(${headlinePos.x}px, ${headlinePos.y}px)`,
                transition: isDraggingHeadline ? 'none' : 'transform 0.1s ease-out',
                userSelect: 'none',
                touchAction: 'none',
                position: 'relative',
                zIndex: isDraggingHeadline ? 50 : 1
              }}
              onMouseDown={(e) => handleMouseDown(e, 'headline')}
            >
              <h2 
                className={cn(
                  "text-center leading-tight break-words",
                  isBottomOverlay ? "max-w-full" : "max-w-[90%]"
                )}
                style={textStyle}
              >
                {headline}
              </h2>
            </div>
          )}

          {description && (
            <div 
              className={cn(
                "px-6 mt-4 cursor-move",
                isDraggingDescription && "select-none"
              )}
              style={{
                transform: `translate(${descriptionPos.x}px, ${descriptionPos.y}px)`,
                transition: isDraggingDescription ? 'none' : 'transform 0.1s ease-out',
                userSelect: 'none',
                touchAction: 'none',
                position: 'relative',
                zIndex: isDraggingDescription ? 50 : 1
              }}
              onMouseDown={(e) => handleMouseDown(e, 'description')}
            >
              <p 
                className={cn(
                  "text-center leading-tight break-words text-sm",
                  isBottomOverlay ? "max-w-full" : "max-w-[90%]"
                )}
                style={descriptionStyle}
              >
                {description}
              </p>
            </div>
          )}
          
          {ctaText && (
            <div 
              className={cn(
                "w-full flex justify-center items-center mt-auto px-6 pb-8 cursor-move",
                isDraggingCta && "select-none"
              )}
              style={{
                transform: `translate(${ctaPos.x}px, ${ctaPos.y}px)`,
                transition: isDraggingCta ? 'none' : 'transform 0.1s ease-out',
                userSelect: 'none',
                touchAction: 'none',
                position: 'relative',
                zIndex: isDraggingCta ? 50 : 1
              }}
              onMouseDown={(e) => handleMouseDown(e, 'cta')}
            >
              <div 
                className="relative transform flex items-center justify-center gap-2 mx-auto"
                style={buttonStyle}
                onMouseEnter={() => onButtonHover(true)}
                onMouseLeave={() => onButtonHover(false)}
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
  );
}