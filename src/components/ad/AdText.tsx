import { CSSProperties } from "react";

interface AdTextProps {
  style?: string;
  accentColor: string;
  fontFamily: string;
}

export function getTextStyle({ style = 'minimal', accentColor, fontFamily }: AdTextProps): CSSProperties {
  const baseStyle: CSSProperties = {
    fontWeight: 'bold',
    fontSize: 'clamp(1rem, min(4vw, 4vh), 2.5rem)',
    lineHeight: '1.2',
    maxWidth: '100%',
    margin: '0 auto',
    padding: '1rem',
    fontFamily: fontFamily || 'inherit',
    textAlign: 'center',
    display: 'block',
    transition: 'all 0.3s ease',
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
        fontSize: 'clamp(2rem, min(6vw, 6vh), 4rem)',
        fontWeight: '600',
        letterSpacing: '0.5px',
        lineHeight: '1.3',
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
        width: '90%',
        margin: '0 auto',
        padding: '0.5rem',
        marginBottom: '0.5rem',
      };
    default:
      return {
        ...baseStyle,
        color: '#000000',
      };
  }
}