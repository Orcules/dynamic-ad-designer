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
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        letterSpacing: '-0.02em',
      };
    case 'elegant':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        letterSpacing: '0.02em',
        fontWeight: '600',
      };
    case 'dynamic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
        transform: 'skew(-3deg)',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 4px 8px rgba(0,0,0,0.5)',
        letterSpacing: '-0.03em',
      };
    case 'wave':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
        transform: 'rotate(-2deg)',
      };
    case 'cinematic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
        fontWeight: '500',
      };
    case 'duotone':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
        letterSpacing: '0.01em',
      };
    case 'vignette':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 6px rgba(0,0,0,0.4)',
        fontWeight: '600',
      };
    case 'luxury':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        letterSpacing: '0.04em',
        fontWeight: '500',
      };
    default:
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
      };
  }
}