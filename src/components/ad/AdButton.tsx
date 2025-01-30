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
          ? `0 8px 16px ${accentColor}40` 
          : `0 4px 12px ${accentColor}30`,
      };
    case 'elegant':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '50px',
        padding: '1em 2.5em',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        boxShadow: isHovered 
          ? `0 6px 12px ${accentColor}30` 
          : `0 4px 8px ${accentColor}20`,
      };
    case 'dynamic':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        transform: isHovered ? 'translateY(-2px) skew(-5deg)' : 'skew(-5deg)',
        boxShadow: isHovered 
          ? `4px 4px 8px ${accentColor}30` 
          : `2px 2px 6px ${accentColor}20`,
      };
    case 'spotlight':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '8px',
        boxShadow: isHovered 
          ? `0 0 20px ${accentColor}60` 
          : `0 0 15px ${accentColor}40`,
      };
    case 'wave':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '12px',
        transform: isHovered 
          ? 'translateY(-2px) perspective(500px) rotateX(5deg)' 
          : 'perspective(500px) rotateX(5deg)',
      };
    case 'cinematic':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        boxShadow: isHovered 
          ? `0 8px 20px ${accentColor}40` 
          : `0 4px 12px ${accentColor}30`,
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '8px',
        opacity: '0.95',
      };
    case 'duotone':
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}99 100%)`,
        borderRadius: '6px',
        boxShadow: isHovered 
          ? `4px 4px 12px ${accentColor}30` 
          : `2px 2px 8px ${accentColor}20`,
      };
    case 'vignette':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '10px',
        boxShadow: isHovered 
          ? `0 0 25px ${accentColor}50` 
          : `0 0 15px ${accentColor}30`,
      };
    case 'luxury':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        boxShadow: isHovered 
          ? `4px 4px 15px ${accentColor}40` 
          : `2px 2px 10px ${accentColor}30`,
      };
    default:
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '8px',
      };
  }
}