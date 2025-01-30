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
    fontSize: 'clamp(0.75rem, 1.5vw, 1rem)',
    fontWeight: '600',
    cursor: 'pointer',
    transform: isHovered ? 'translateY(-2px)' : 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5em',
    width: 'auto',
    minWidth: 'min(140px, 35%)',
    maxWidth: '70%',
    minHeight: '2.5em',
    lineHeight: '1',
    fontFamily: fontFamily || 'inherit',
    textAlign: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    marginBottom: '1rem',
    zIndex: 10,
    color: '#FFFFFF',
  };

  switch (style) {
    case 'modern':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '8px',
        boxShadow: isHovered 
          ? `0 8px 16px ${accentColor}40, 0 0 0 2px ${accentColor}` 
          : `0 4px 12px ${accentColor}30`,
      };
    case 'elegant':
      return {
        ...baseStyle,
        background: 'transparent',
        border: `2px solid ${accentColor}`,
        borderRadius: '50px',
        padding: '1em 2.5em',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        boxShadow: isHovered 
          ? `0 6px 12px ${accentColor}30, inset 0 0 0 2px ${accentColor}` 
          : 'none',
      };
    case 'dynamic':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        transform: isHovered ? 'translateY(-2px) skew(-10deg)' : 'skew(-10deg)',
        boxShadow: isHovered 
          ? `4px 4px 0px ${accentColor}` 
          : `2px 2px 0px ${accentColor}`,
      };
    case 'spotlight':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '8px',
        boxShadow: isHovered 
          ? `0 0 30px ${accentColor}80` 
          : `0 0 20px ${accentColor}40`,
      };
    case 'wave':
      return {
        ...baseStyle,
        background: `linear-gradient(45deg, ${accentColor}, ${accentColor}dd)`,
        borderRadius: '12px',
        transform: isHovered 
          ? 'translateY(-2px) perspective(500px) rotateX(10deg)' 
          : 'perspective(500px) rotateX(10deg)',
      };
    case 'cinematic':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '0',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        boxShadow: isHovered 
          ? `0 8px 20px ${accentColor}40, -4px 0 0 #fff, 4px 0 0 #fff` 
          : `-2px 0 0 #fff, 2px 0 0 #fff`,
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        opacity: isHovered ? '1' : '0.9',
        transform: isHovered ? 'translateY(-2px)' : 'none',
      };
    case 'duotone':
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}99 100%)`,
        borderRadius: '6px',
        boxShadow: isHovered 
          ? `4px 4px 0 rgba(0,0,0,0.3)` 
          : `2px 2px 0 rgba(0,0,0,0.2)`,
        border: '2px solid #fff',
      };
    case 'vignette':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '10px',
        boxShadow: isHovered 
          ? `0 0 25px ${accentColor}50, inset 0 0 0 2px #fff` 
          : `0 0 15px ${accentColor}30`,
      };
    case 'luxury':
      return {
        ...baseStyle,
        background: 'transparent',
        border: `1px solid ${accentColor}`,
        borderRadius: '0',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        boxShadow: isHovered 
          ? `4px 4px 15px ${accentColor}40, inset 0 0 0 1px ${accentColor}` 
          : 'none',
        padding: '1.2em 3em',
      };
    default:
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '8px',
      };
  }
}