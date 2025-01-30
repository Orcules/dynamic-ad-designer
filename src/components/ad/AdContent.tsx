import { ArrowBigDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";

interface AdContentProps {
  headline?: string;
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
  ctaText,
  textStyle,
  buttonStyle,
  templateStyle,
  isButtonHovered,
  onButtonHover,
}: AdContentProps) {
  if (!headline && !ctaText) return null;

  const isBottomOverlay = templateStyle?.startsWith('overlay-bottom-');
  const [headlinePos, setHeadlinePos] = useState<Position>({ x: 0, y: 0 });
  const [ctaPos, setCtaPos] = useState<Position>({ x: 0, y: 0 });
  const [isDraggingHeadline, setIsDraggingHeadline] = useState(false);
  const [isDraggingCta, setIsDraggingCta] = useState(false);
  const dragStartPos = useRef<Position>({ x: 0, y: 0 });
  const elementStartPos = useRef<Position>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, type: 'headline' | 'cta') => {
    const setIsDragging = type === 'headline' ? setIsDraggingHeadline : setIsDraggingCta;
    const currentPos = type === 'headline' ? headlinePos : ctaPos;
    
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = currentPos;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingHeadline && !isDraggingCta) return;

    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;

    if (isDraggingHeadline) {
      setHeadlinePos({
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
                transition: isDraggingHeadline ? 'none' : 'transform 0.1s ease-out'
              }}
              onMouseDown={(e) => handleMouseDown(e, 'headline')}
            >
              <h2 
                className={cn(
                  "text-center leading-tight break-words",
                  isBottomOverlay ? "max-w-full" : "max-w-[90%]",
                  templateStyle === 'minimal' ? 'text-black' : 'text-white'
                )}
                style={textStyle}
              >
                {headline}
              </h2>
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
                transition: isDraggingCta ? 'none' : 'transform 0.1s ease-out'
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