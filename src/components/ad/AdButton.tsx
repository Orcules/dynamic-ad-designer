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
    fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
    fontWeight: '600',
    cursor: 'pointer',
    transform: isHovered ? 'translateY(-2px)' : 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5em',
    width: 'auto',
    minWidth: 'min(140px, 40%)',
    maxWidth: '80%',
    minHeight: '2.75em',
    lineHeight: '1.2',
    fontFamily: fontFamily || 'inherit',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    marginBottom: '1.5rem',
    zIndex: 10,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  switch (style) {
    case 'modern':
      return {
        ...baseStyle,
        background: accentColor,
        border: '3px solid #FFFFFF',
        boxShadow: isHovered ? '6px 6px 0px rgba(0,0,0,0.3)' : '4px 4px 0px rgba(0,0,0,0.3)',
        transform: isHovered ? 'translate(-2px, -2px)' : 'none',
      };
    case 'elegant':
      return {
        ...baseStyle,
        background: 'transparent',
        border: `2px solid ${accentColor}`,
        boxShadow: isHovered ? 
          `4px 4px 0px ${accentColor}, -4px -4px 0px ${accentColor}` : 
          `2px 2px 0px ${accentColor}, -2px -2px 0px ${accentColor}`,
      };
    case 'dynamic':
      return {
        ...baseStyle,
        background: accentColor,
        border: '2px solid #FFFFFF',
        transform: isHovered ? 'translateY(-2px) skew(-5deg)' : 'skew(-5deg)',
        boxShadow: isHovered ? '6px 6px 0px rgba(0,0,0,0.4)' : '4px 4px 0px rgba(0,0,0,0.3)',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        background: accentColor,
        border: '4px double #FFFFFF',
        boxShadow: isHovered ? 
          '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3)' : 
          '0 0 5px rgba(255,255,255,0.3)',
      };
    case 'wave':
      return {
        ...baseStyle,
        background: accentColor,
        border: '2px solid #FFFFFF',
        transform: isHovered ? 'translateY(-2px) rotate(-1deg)' : 'rotate(-1deg)',
        boxShadow: isHovered ? '4px 4px 0px #FFFFFF' : '2px 2px 0px #FFFFFF',
      };
    case 'cinematic':
      return {
        ...baseStyle,
        background: 'transparent',
        border: '2px solid #FFFFFF',
        boxShadow: isHovered ? 
          `inset 0 0 0 2px ${accentColor}, 0 0 10px rgba(255,255,255,0.3)` : 
          `inset 0 0 0 0 ${accentColor}`,
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        background: accentColor,
        border: '1px solid rgba(255,255,255,0.3)',
        opacity: isHovered ? '1' : '0.9',
        boxShadow: isHovered ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
      };
    case 'duotone':
      return {
        ...baseStyle,
        background: accentColor,
        border: '2px solid #FFFFFF',
        boxShadow: isHovered ? '6px 6px 0px #FFFFFF' : '4px 4px 0px #FFFFFF',
        transform: isHovered ? 'translate(-2px, -2px)' : 'none',
      };
    case 'vignette':
      return {
        ...baseStyle,
        background: accentColor,
        border: '3px solid rgba(255,255,255,0.5)',
        boxShadow: isHovered ? 
          'inset 0 0 20px rgba(255,255,255,0.3), 0 0 10px rgba(0,0,0,0.3)' : 
          'inset 0 0 10px rgba(255,255,255,0.2)',
      };
    case 'luxury':
      return {
        ...baseStyle,
        background: 'transparent',
        border: `2px solid ${accentColor}`,
        boxShadow: isHovered ? 
          `4px 4px 0px ${accentColor}, -4px -4px 0px ${accentColor}` : 
          `2px 2px 0px ${accentColor}, -2px -2px 0px ${accentColor}`,
      };
    default:
      return {
        ...baseStyle,
        background: accentColor,
        boxShadow: isHovered ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
      };
  }
}