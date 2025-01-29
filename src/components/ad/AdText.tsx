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
        letterSpacing: '0.5px',
      };
    case 'neon':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}`,
        letterSpacing: '1px',
      };
    case 'elegant':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '600',
        letterSpacing: '0.7px',
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
      };
    case 'dynamic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        transform: 'skew(-5deg)',
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
      };
    case 'wave':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '1px 1px 4px rgba(0,0,0,0.2)',
      };
    case 'luxury':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontSize: 'clamp(1.2rem, 3vw, 2rem)',
        fontWeight: '600',
        letterSpacing: '0.5px',
        lineHeight: '1.3',
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
        width: '100%',
        margin: '0 auto',
        padding: '0.25rem',
        marginBottom: '0.25rem',
      };
    default:
      return {
        ...baseStyle,
        color: '#000000',
      };
  }
}