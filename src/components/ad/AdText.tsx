import { CSSProperties } from "react";

interface AdTextProps {
  style?: string;
  accentColor: string;
  fontFamily: string;
}

export function getTextStyle({ style = 'minimal', accentColor, fontFamily }: AdTextProps): CSSProperties {
  const baseStyle: CSSProperties = {
    fontWeight: 'bold',
    fontSize: 'clamp(1.5rem, 4vw, 3rem)',
    lineHeight: '1.2',
    maxWidth: '100%',
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
        textShadow: '2px 2px 0 rgba(0,0,0,0.8), -2px -2px 0 rgba(0,0,0,0.8)',
        fontWeight: '900',
        letterSpacing: '1px',
        background: 'rgba(0,0,0,0.4)',
        borderRadius: '8px',
        padding: '1.5rem',
        backdropFilter: 'blur(4px)',
      };
    case 'elegant':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: '3px',
        fontWeight: '800',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)',
        padding: '2rem',
        borderLeft: '4px solid #FFFFFF',
        borderRight: '4px solid #FFFFFF',
      };
    case 'dynamic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '900',
        textTransform: 'uppercase',
        textShadow: '3px 3px 0 #000000, 6px 6px 0 rgba(0,0,0,0.4)',
        transform: 'skew(-5deg)',
        background: 'rgba(0,0,0,0.6)',
        padding: '2rem',
        border: '3px solid #FFFFFF',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '800',
        letterSpacing: '2px',
        textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.6)',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        padding: '2rem',
        borderRadius: '16px',
        border: '2px solid rgba(255,255,255,0.3)',
      };
    case 'wave':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '900',
        letterSpacing: '1px',
        textShadow: '2px 4px 8px rgba(0,0,0,0.9)',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)',
        padding: '2rem',
        borderRadius: '0 16px 0 16px',
        border: '3px solid rgba(255,255,255,0.5)',
      };
    case 'cinematic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '800',
        letterSpacing: '4px',
        textTransform: 'uppercase',
        textShadow: '3px 3px 6px rgba(0,0,0,0.9)',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)',
        padding: '2rem',
        border: '4px double rgba(255,255,255,0.8)',
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '700',
        letterSpacing: '2px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
        padding: '1.5rem',
        borderRadius: '8px',
        backdropFilter: 'blur(2px)',
      };
    case 'duotone':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '900',
        letterSpacing: '2px',
        textShadow: '3px 3px 0 rgba(0,0,0,0.8)',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)',
        padding: '2rem',
        border: '3px solid #FFFFFF',
        borderRadius: '16px',
      };
    case 'vignette':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '800',
        letterSpacing: '1px',
        textShadow: '2px 2px 8px rgba(0,0,0,0.9)',
        background: 'radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)',
        padding: '2rem',
        borderRadius: '20px',
        border: '2px solid rgba(255,255,255,0.4)',
      };
    case 'luxury':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '700',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 100%)',
        padding: '2rem',
        border: '1px solid rgba(255,255,255,0.6)',
        borderRadius: '4px',
      };
    default:
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        background: 'rgba(0,0,0,0.5)',
        padding: '1.5rem',
      };
  }
}