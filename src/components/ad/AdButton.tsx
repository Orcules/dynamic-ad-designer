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
    transition: 'all 0.3s ease',
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
        boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.2)' : '0 4px 8px rgba(0,0,0,0.1)',
      };
    case 'elegant':
      return {
        ...baseStyle,
        background: 'transparent',
        border: `2px solid ${accentColor}`,
        borderRadius: '50px',
        boxShadow: isHovered ? '0 6px 12px rgba(0,0,0,0.2)' : '0 3px 6px rgba(0,0,0,0.1)',
      };
    case 'dynamic':
      return {
        ...baseStyle,
        background: accentColor,
        transform: isHovered ? 'translateY(-2px) skew(-10deg)' : 'skew(-10deg)',
        boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.2)' : '0 4px 8px rgba(0,0,0,0.1)',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '8px',
        boxShadow: isHovered ? '0 0 20px rgba(255,255,255,0.3)' : '0 0 10px rgba(255,255,255,0.1)',
      };
    case 'wave':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        transform: isHovered ? 'translateY(-2px) rotate(-2deg)' : 'rotate(-2deg)',
        boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.2)' : '0 4px 8px rgba(0,0,0,0.1)',
      };
    case 'cinematic':
      return {
        ...baseStyle,
        background: accentColor,
        border: '2px solid #FFFFFF',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.2)',
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        opacity: isHovered ? '1' : '0.9',
        boxShadow: isHovered ? '0 6px 12px rgba(0,0,0,0.2)' : '0 3px 6px rgba(0,0,0,0.1)',
      };
    case 'duotone':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '8px',
        border: '2px solid #FFFFFF',
        boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.2)' : '0 4px 8px rgba(0,0,0,0.1)',
      };
    case 'vignette':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.2)',
      };
    case 'luxury':
      return {
        ...baseStyle,
        background: 'transparent',
        border: `1px solid ${accentColor}`,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        boxShadow: isHovered ? '0 6px 12px rgba(0,0,0,0.2)' : '0 3px 6px rgba(0,0,0,0.1)',
      };
    default:
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        boxShadow: isHovered ? '0 6px 12px rgba(0,0,0,0.2)' : '0 3px 6px rgba(0,0,0,0.1)',
      };
  }
}