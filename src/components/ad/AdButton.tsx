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
      };
    case 'dynamic':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        transform: isHovered ? 'translateY(-2px) skew(-5deg)' : 'skew(-5deg)',
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '8px',
        opacity: '0.95',
      };
    default:
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '8px',
      };
  }
}