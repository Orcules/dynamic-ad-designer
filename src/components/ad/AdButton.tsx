import { CSSProperties } from "react";

interface AdButtonProps {
  style?: string;
  accentColor: string;
  isHovered: boolean;
  fontFamily: string;
}

export function getButtonStyle({ style = 'minimal', accentColor, isHovered, fontFamily }: AdButtonProps): CSSProperties {
  const baseStyle: CSSProperties = {
    padding: '0.8em 2em',
    fontSize: 'clamp(0.75rem, 1.25vw, 1rem)',
    fontWeight: '600',
    cursor: 'pointer',
    position: 'relative',
    maxWidth: '90%',
    margin: '0 auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'auto',
    minWidth: 'min(180px, 45%)',
    minHeight: '2.5em',
    lineHeight: '1',
    fontFamily: fontFamily || 'inherit',
    textAlign: 'center',
    color: '#FFFFFF',
    border: 'none',
    boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
    transform: isHovered ? 'translateY(-2px)' : 'none',
    transition: 'all 0.3s ease',
    zIndex: 10,
  };

  switch (style) {
    case 'modern':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        position: 'absolute',
        bottom: '12%',
        left: '50%',
        transform: `translateX(-50%) ${isHovered ? 'translateY(-2px)' : 'none'}`,
        clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)',
        padding: '1em 2.5em',
      };
    case 'bold':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '50px',
        position: 'absolute',
        bottom: '15%',
        left: '50%',
        transform: `translateX(-50%) ${isHovered ? 'translateY(-2px)' : 'none'}`,
        padding: '1em 2.5em',
        letterSpacing: '0.05em',
        boxShadow: isHovered 
          ? `0 8px 20px ${accentColor}66` 
          : `0 4px 12px ${accentColor}40`,
      };
    case 'elegant':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '0 50px 50px 0',
        position: 'absolute',
        bottom: '20%',
        left: '8%',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        padding: '1em 2.5em',
        maxWidth: '45%',
        boxShadow: isHovered 
          ? `4px 4px 12px ${accentColor}66` 
          : `2px 2px 8px ${accentColor}40`,
      };
    default: // minimal
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '8px',
        position: 'absolute',
        bottom: '15%',
        left: '50%',
        transform: `translateX(-50%) ${isHovered ? 'translateY(-2px)' : 'none'}`,
        backdropFilter: 'blur(4px)',
      };
  }
}