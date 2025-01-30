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

  // Check if it's a bottom overlay style
  if (style?.startsWith('overlay-bottom-')) {
    return {
      ...baseStyle,
      background: accentColor,
      borderRadius: '4px',
      boxShadow: isHovered ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '0.5rem', // Reduced margin for bottom overlay
      fontSize: 'clamp(0.75rem, 1.25vw, 1rem)', // Slightly smaller font for overlay
    };
  }

  switch (style) {
    case 'modern':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        boxShadow: isHovered ? '0 6px 12px rgba(0,0,0,0.2)' : '0 4px 6px rgba(0,0,0,0.1)',
      };
    case 'elegant':
      return {
        ...baseStyle,
        background: 'transparent',
        border: `2px solid ${accentColor}`,
        borderRadius: '50px',
        boxShadow: isHovered ? '0 4px 8px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
      };
    case 'dynamic':
      return {
        ...baseStyle,
        background: accentColor,
        transform: isHovered ? 'translateY(-2px) skew(-5deg)' : 'skew(-5deg)',
        boxShadow: isHovered ? '0 6px 12px rgba(0,0,0,0.2)' : '0 4px 6px rgba(0,0,0,0.1)',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '6px',
        boxShadow: isHovered ? '0 6px 12px rgba(0,0,0,0.25)' : '0 4px 8px rgba(0,0,0,0.15)',
      };
    case 'wave':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        transform: isHovered ? 'translateY(-2px) rotate(-1deg)' : 'rotate(-1deg)',
        boxShadow: isHovered ? '0 6px 12px rgba(0,0,0,0.2)' : '0 4px 6px rgba(0,0,0,0.1)',
      };
    case 'cinematic':
      return {
        ...baseStyle,
        background: accentColor,
        border: '1px solid rgba(255,255,255,0.2)',
        letterSpacing: '0.1em',
        boxShadow: isHovered ? '0 6px 12px rgba(0,0,0,0.25)' : '0 4px 8px rgba(0,0,0,0.15)',
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        opacity: isHovered ? '1' : '0.9',
        boxShadow: isHovered ? '0 4px 8px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
      };
    case 'duotone':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '6px',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: isHovered ? '0 6px 12px rgba(0,0,0,0.2)' : '0 4px 6px rgba(0,0,0,0.1)',
      };
    case 'vignette':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        boxShadow: isHovered ? '0 6px 12px rgba(0,0,0,0.25)' : '0 4px 8px rgba(0,0,0,0.15)',
      };
    case 'luxury':
      return {
        ...baseStyle,
        background: 'transparent',
        border: `1px solid ${accentColor}`,
        letterSpacing: '0.1em',
        boxShadow: isHovered ? '0 4px 8px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
      };
    default:
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        boxShadow: isHovered ? '0 4px 8px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
      };
  }
}
