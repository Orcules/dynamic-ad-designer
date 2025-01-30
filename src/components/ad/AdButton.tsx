import { CSSProperties } from "react";

interface AdButtonProps {
  style?: string;
  accentColor: string;
  isHovered: boolean;
  fontFamily: string;
}

export function getButtonStyle({ style = 'minimal', accentColor, isHovered, fontFamily }: AdButtonProps): CSSProperties {
  const baseStyle: CSSProperties = {
    padding: '1em 2.5em',
    fontSize: 'clamp(0.875rem, 2vw, 1.25rem)',
    fontWeight: '600',
    cursor: 'pointer',
    transform: isHovered ? 'translateY(-2px)' : 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5em',
    width: 'auto',
    minWidth: 'min(160px, 40%)',
    maxWidth: '80%',
    minHeight: '3em',
    lineHeight: '1.2',
    fontFamily: fontFamily || 'inherit',
    textAlign: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    marginBottom: '1.5rem',
    zIndex: 10,
    color: '#FFFFFF',
  };

  switch (style) {
    case 'modern':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        boxShadow: isHovered 
          ? `0 10px 20px ${accentColor}50, 0 0 0 2px ${accentColor}` 
          : `0 5px 15px ${accentColor}40`,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        border: 'none',
      };
    case 'elegant':
      return {
        ...baseStyle,
        background: 'transparent',
        border: `2px solid ${accentColor}`,
        borderRadius: '50px',
        padding: '1.2em 3em',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        boxShadow: isHovered 
          ? `0 8px 16px ${accentColor}30, inset 0 0 0 2px ${accentColor}` 
          : 'none',
        backdropFilter: 'blur(4px)',
      };
    case 'dynamic':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '0',
        transform: isHovered 
          ? 'translateY(-2px) skew(-15deg)' 
          : 'skew(-15deg)',
        boxShadow: isHovered 
          ? `6px 6px 0px ${accentColor}` 
          : `3px 3px 0px ${accentColor}`,
        border: '2px solid #FFFFFF',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '8px',
        boxShadow: isHovered 
          ? `0 0 40px ${accentColor}90` 
          : `0 0 25px ${accentColor}60`,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        border: '1px solid rgba(255,255,255,0.3)',
      };
    case 'wave':
      return {
        ...baseStyle,
        background: `linear-gradient(45deg, ${accentColor}, ${accentColor}dd)`,
        borderRadius: '12px',
        transform: isHovered 
          ? 'translateY(-2px) perspective(500px) rotateX(15deg)' 
          : 'perspective(500px) rotateX(15deg)',
        boxShadow: `0 5px 15px ${accentColor}40`,
        border: '1px solid rgba(255,255,255,0.2)',
      };
    case 'cinematic':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '0',
        letterSpacing: '4px',
        textTransform: 'uppercase',
        boxShadow: isHovered 
          ? `0 10px 25px ${accentColor}50, -6px 0 0 #fff, 6px 0 0 #fff` 
          : `-3px 0 0 #fff, 3px 0 0 #fff`,
        border: '2px solid #FFFFFF',
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '6px',
        opacity: isHovered ? '1' : '0.9',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        boxShadow: isHovered 
          ? `0 8px 20px ${accentColor}40` 
          : `0 4px 12px ${accentColor}30`,
        border: '1px solid rgba(255,255,255,0.2)',
      };
    case 'duotone':
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}99 100%)`,
        borderRadius: '8px',
        boxShadow: isHovered 
          ? `6px 6px 0 rgba(0,0,0,0.4)` 
          : `3px 3px 0 rgba(0,0,0,0.3)`,
        border: '3px solid #fff',
        textTransform: 'uppercase',
        letterSpacing: '2px',
      };
    case 'vignette':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '12px',
        boxShadow: isHovered 
          ? `0 0 30px ${accentColor}60, inset 0 0 0 2px #fff` 
          : `0 0 20px ${accentColor}40`,
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255,255,255,0.4)',
      };
    case 'luxury':
      return {
        ...baseStyle,
        background: 'transparent',
        border: `1px solid ${accentColor}`,
        borderRadius: '0',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        boxShadow: isHovered 
          ? `6px 6px 20px ${accentColor}40, inset 0 0 0 1px ${accentColor}` 
          : 'none',
        padding: '1.5em 3.5em',
        backdropFilter: 'blur(4px)',
      };
    default:
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '8px',
        boxShadow: isHovered 
          ? `0 8px 16px ${accentColor}40` 
          : `0 4px 8px ${accentColor}30`,
      };
  }
}