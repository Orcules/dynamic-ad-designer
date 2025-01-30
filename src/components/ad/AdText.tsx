import { CSSProperties } from "react";

interface AdTextProps {
  style?: string;
  accentColor: string;
  fontFamily: string;
}

export function getTextStyle({ style = 'minimal', accentColor, fontFamily }: AdTextProps): CSSProperties {
  const baseStyle: CSSProperties = {
    fontWeight: 'bold',
    fontSize: 'clamp(0.8rem, min(2.5vw, 2.5vh), 2rem)',
    lineHeight: '1.2',
    maxWidth: '100%',
    margin: '0 auto',
    padding: '0.5rem',
    fontFamily: fontFamily || 'inherit',
    textAlign: 'center',
    display: 'block',
    transition: 'all 0.3s ease',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    hyphens: 'auto',
  };

  switch (style) {
    case 'modern':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
      };
    case 'elegant':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '600',
        letterSpacing: '1px',
      };
    case 'dynamic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        opacity: '0.9',
      };
    default:
      return {
        ...baseStyle,
        color: '#000000',
      };
  }
}