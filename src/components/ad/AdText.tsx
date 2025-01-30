import { CSSProperties } from "react";

interface AdTextProps {
  style?: string;
  accentColor: string;
  fontFamily: string;
}

export function getTextStyle({ style = 'minimal', accentColor, fontFamily }: AdTextProps): CSSProperties {
  const baseStyle: CSSProperties = {
    fontWeight: 'bold',
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
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
        textShadow: '2px 2px 0 rgba(0,0,0,0.8), -2px -2px 0 rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.9)',
        fontWeight: '900',
        letterSpacing: '2px',
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '12px',
        padding: '2rem',
        backdropFilter: 'blur(8px)',
        border: '3px solid rgba(255,255,255,0.2)',
      };
    case 'elegant':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: '4px',
        fontWeight: '800',
        textShadow: '2px 2px 8px rgba(0,0,0,0.9), 0 0 30px rgba(255,255,255,0.3)',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)',
        padding: '2.5rem',
        borderLeft: '6px solid #FFFFFF',
        borderRight: '6px solid #FFFFFF',
        backdropFilter: 'blur(10px)',
      };
    case 'dynamic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '900',
        textTransform: 'uppercase',
        textShadow: '4px 4px 0 #000000, 8px 8px 0 rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.8)',
        transform: 'skew(-5deg)',
        background: 'rgba(0,0,0,0.7)',
        padding: '2.5rem',
        border: '4px solid #FFFFFF',
        boxShadow: '0 0 30px rgba(0,0,0,0.8)',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '800',
        letterSpacing: '3px',
        textShadow: '0 0 30px rgba(255,255,255,0.9), 0 0 60px rgba(255,255,255,0.6), 2px 2px 4px rgba(0,0,0,0.9)',
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        padding: '2.5rem',
        borderRadius: '20px',
        border: '3px solid rgba(255,255,255,0.4)',
        boxShadow: '0 0 40px rgba(0,0,0,0.6)',
      };
    case 'wave':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '900',
        letterSpacing: '2px',
        textShadow: '3px 3px 6px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.9)',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 100%)',
        padding: '2.5rem',
        borderRadius: '0 20px 0 20px',
        border: '4px solid rgba(255,255,255,0.6)',
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)',
      };
    case 'cinematic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '800',
        letterSpacing: '6px',
        textTransform: 'uppercase',
        textShadow: '4px 4px 8px rgba(0,0,0,1), 0 0 30px rgba(0,0,0,0.9)',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)',
        padding: '3rem',
        border: '6px double rgba(255,255,255,0.9)',
        boxShadow: '0 0 40px rgba(0,0,0,0.7)',
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '700',
        letterSpacing: '3px',
        textShadow: '3px 3px 6px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8)',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 100%)',
        padding: '2rem',
        borderRadius: '12px',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 0 30px rgba(0,0,0,0.6)',
      };
    case 'duotone':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '900',
        letterSpacing: '3px',
        textShadow: '4px 4px 0 rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.8)',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 100%)',
        padding: '2.5rem',
        border: '4px solid #FFFFFF',
        borderRadius: '20px',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.7)',
      };
    case 'vignette':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '800',
        letterSpacing: '2px',
        textShadow: '3px 3px 10px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.8)',
        background: 'radial-gradient(circle at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.9) 100%)',
        padding: '2.5rem',
        borderRadius: '24px',
        border: '3px solid rgba(255,255,255,0.5)',
        boxShadow: '0 0 50px rgba(0,0,0,0.8)',
      };
    case 'luxury':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '700',
        letterSpacing: '4px',
        textTransform: 'uppercase',
        textShadow: '3px 3px 6px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.7)',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)',
        padding: '2.5rem',
        border: '2px solid rgba(255,255,255,0.7)',
        borderRadius: '6px',
        boxShadow: '0 0 40px rgba(0,0,0,0.6)',
      };
    default:
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '3px 3px 6px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8)',
        background: 'rgba(0,0,0,0.7)',
        padding: '2rem',
        boxShadow: '0 0 30px rgba(0,0,0,0.6)',
      };
  }
}