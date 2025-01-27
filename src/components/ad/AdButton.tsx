import { CSSProperties } from "react";
import { ArrowBigDown } from "lucide-react";

interface AdButtonProps {
  style?: string;
  accentColor: string;
  isHovered: boolean;
  fontFamily: string;
}

export function getButtonStyle({ style = 'minimal', accentColor, isHovered, fontFamily }: AdButtonProps): CSSProperties {
  const baseStyle: CSSProperties = {
    padding: '0.8em 2em',
    fontSize: 'clamp(0.75rem, 1.5vw, 1rem)',
    fontWeight: '600',
    cursor: 'pointer',
    position: 'absolute',
    bottom: '10%',
    left: '50%',
    transform: `translateX(-50%) ${isHovered ? 'translateY(-2px)' : 'none'}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5em',
    width: 'auto',
    minWidth: 'min(160px, 40%)',
    maxWidth: '80%',
    minHeight: '2.5em',
    lineHeight: '1',
    fontFamily: fontFamily || 'inherit',
    textAlign: 'center',
    color: '#FFFFFF',
    border: 'none',
    boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
    zIndex: 10,
  };

  switch (style) {
    case 'dynamic':
      return {
        ...baseStyle,
        background: accentColor,
        transform: `translateX(-50%) skew(-5deg) ${isHovered ? 'translateY(-2px)' : 'none'}`,
        borderRadius: '0 12px 12px 0',
        clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)',
        padding: '1em 2.5em',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '50px',
        padding: '1em 2.5em',
        boxShadow: isHovered 
          ? `0 8px 20px ${accentColor}66` 
          : `0 4px 12px ${accentColor}40`,
      };
    case 'wave':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '20px',
        clipPath: 'polygon(5% 0, 95% 0, 100% 50%, 95% 100%, 5% 100%, 0 50%)',
        padding: '1em 3em',
      };
    case 'geometric':
      return {
        ...baseStyle,
        background: accentColor,
        left: '8%',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
        padding: '1em 2.5em',
      };
    default:
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '8px',
      };
  }
}