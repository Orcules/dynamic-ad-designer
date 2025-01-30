import { CSSProperties } from "react";

interface AdTextProps {
  style?: string;
  accentColor: string;
  fontFamily: string;
}

export function getTextStyle({ style = 'minimal', accentColor, fontFamily }: AdTextProps): CSSProperties {
  const baseStyle: CSSProperties = {
    fontWeight: 'bold',
    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
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
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        background: 'rgba(0,0,0,0.5)',
        padding: '2rem',
        borderRadius: '8px',
      };
    case 'elegant':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        letterSpacing: '0.05em',
        background: 'rgba(0,0,0,0.4)',
        padding: '2rem',
      };
    case 'dynamic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '3px 3px 6px rgba(0,0,0,0.6)',
        transform: 'skew(-5deg)',
        background: 'rgba(0,0,0,0.6)',
        padding: '2rem',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
        background: 'radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)',
        padding: '3rem',
      };
    case 'wave':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 4px rgba(0,0,0,0.6)',
        background: 'linear-gradient(45deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)',
        padding: '2rem',
      };
    case 'cinematic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
        letterSpacing: '0.1em',
        background: 'rgba(0,0,0,0.7)',
        padding: '2.5rem',
        border: '4px double rgba(255,255,255,0.3)',
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
        padding: '2rem',
      };
    case 'duotone':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
        background: 'linear-gradient(45deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)',
        padding: '2rem',
        border: '3px solid rgba(255,255,255,0.2)',
      };
    case 'vignette':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 6px rgba(0,0,0,0.7)',
        background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.7) 100%)',
        padding: '2.5rem',
      };
    case 'luxury':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 4px rgba(0,0,0,0.6)',
        letterSpacing: '0.08em',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)',
        padding: '2rem',
        border: '2px solid rgba(255,255,255,0.3)',
      };
    default:
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
        background: 'rgba(0,0,0,0.5)',
        padding: '2rem',
      };
  }
}