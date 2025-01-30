import { CSSProperties } from "react";

interface AdTextProps {
  style?: string;
  accentColor: string;
  fontFamily: string;
}

export function getTextStyle({ style = 'minimal', accentColor, fontFamily }: AdTextProps): CSSProperties {
  const baseStyle: CSSProperties = {
    fontWeight: 'bold',
    fontSize: 'clamp(2rem, 4vw, 3.5rem)',
    lineHeight: '1.2',
    maxWidth: '90%',
    margin: '0 auto',
    padding: '1rem',
    fontFamily: fontFamily || 'system-ui',
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
        textShadow: '4px 4px 0px rgba(0,0,0,0.5)',
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        border: '4px solid #FFFFFF',
        padding: '2rem',
        boxShadow: '8px 8px 0px rgba(0,0,0,0.3)',
      };
    case 'elegant':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        letterSpacing: '0.15em',
        fontWeight: '600',
        borderLeft: '4px solid ' + accentColor,
        borderRight: '4px solid ' + accentColor,
        padding: '1rem 2rem',
      };
    case 'dynamic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '3px 3px 0px rgba(0,0,0,0.8)',
        transform: 'skew(-3deg)',
        border: '3px solid ' + accentColor,
        padding: '1.5rem',
        backgroundColor: 'rgba(0,0,0,0.3)',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3)',
        letterSpacing: '-0.03em',
        border: '8px double ' + accentColor,
        padding: '2rem',
      };
    case 'wave':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 0px ' + accentColor,
        transform: 'rotate(-2deg)',
        borderTop: '4px solid ' + accentColor,
        borderBottom: '4px solid ' + accentColor,
        padding: '1.5rem 1rem',
      };
    case 'cinematic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        border: '2px solid rgba(255,255,255,0.3)',
        padding: '2rem',
        backgroundColor: 'rgba(0,0,0,0.4)',
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
        fontWeight: '500',
        borderLeft: '6px solid ' + accentColor,
        padding: '1rem 2rem',
      };
    case 'duotone':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '4px 4px 0px ' + accentColor,
        letterSpacing: '0.1em',
        border: '3px solid #FFFFFF',
        padding: '1.5rem',
        boxShadow: `8px 8px 0px ${accentColor}`,
      };
    case 'vignette':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 6px rgba(0,0,0,0.4)',
        fontWeight: '600',
        border: '5px solid rgba(255,255,255,0.2)',
        padding: '2rem',
        backgroundColor: 'rgba(0,0,0,0.3)',
      };
    case 'luxury':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        letterSpacing: '0.2em',
        fontWeight: '500',
        border: '1px solid rgba(255,255,255,0.3)',
        borderLeft: '6px solid ' + accentColor,
        borderRight: '6px solid ' + accentColor,
        padding: '2rem 1.5rem',
      };
    default:
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
      };
  }
}