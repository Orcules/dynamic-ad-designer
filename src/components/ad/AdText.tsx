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
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        letterSpacing: '0.5px',
        transform: 'skew(-2deg)',
      };
    case 'elegant':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '300',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
      };
    case 'dynamic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
        transform: 'skew(-5deg)',
        letterSpacing: '-0.5px',
        fontWeight: '900',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '0 0 20px rgba(255,255,255,0.8), 2px 2px 4px rgba(0,0,0,0.4)',
        letterSpacing: '2px',
        fontWeight: '600',
      };
    case 'wave':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        transform: 'perspective(500px) rotateX(10deg)',
        letterSpacing: '1px',
      };
    case 'cinematic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: '4px',
        textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
        fontWeight: '800',
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        opacity: '0.95',
        fontWeight: '500',
        letterSpacing: '1px',
      };
    case 'duotone':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
        letterSpacing: '2px',
        fontWeight: '700',
      };
    case 'vignette':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '0 0 15px rgba(255,255,255,0.5), 2px 2px 4px rgba(0,0,0,0.3)',
        letterSpacing: '1px',
      };
    case 'luxury':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        fontWeight: '300',
      };
    default:
      return {
        ...baseStyle,
        color: '#000000',
      };
  }
}