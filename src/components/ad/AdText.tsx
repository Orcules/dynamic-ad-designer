import { CSSProperties } from "react";

interface AdTextProps {
  style?: string;
  accentColor: string;
  fontFamily: string;
}

export function getTextStyle({ style = 'minimal', accentColor, fontFamily }: AdTextProps): CSSProperties {
  const baseStyle: CSSProperties = {
    fontWeight: 'bold',
    fontSize: 'clamp(1rem, 3vw, 2.5rem)',
    lineHeight: '1.2',
    maxWidth: '100%',
    margin: '0 auto',
    padding: '1rem',
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
        textShadow: '2px 2px 0px rgba(0,0,0,0.3), -2px -2px 0px rgba(255,255,255,0.3)',
        letterSpacing: '2px',
        transform: 'skew(-5deg)',
        fontWeight: '900',
        textTransform: 'uppercase',
        WebkitTextStroke: '1px rgba(0,0,0,0.2)',
      };
    case 'elegant':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '300',
        letterSpacing: '4px',
        textTransform: 'uppercase',
        textShadow: '0 0 20px rgba(0,0,0,0.5)',
        borderBottom: '2px solid rgba(255,255,255,0.3)',
        paddingBottom: '1.5rem',
      };
    case 'dynamic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '3px 3px 0px rgba(0,0,0,0.8)',
        transform: 'rotate(-3deg) skew(-5deg)',
        letterSpacing: '-1px',
        fontWeight: '900',
        WebkitTextStroke: '2px rgba(0,0,0,0.3)',
        padding: '1.5rem',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '10px',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '0 0 30px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 0 10px rgba(255,255,255,0.4), 2px 2px 4px rgba(0,0,0,0.8)',
        letterSpacing: '3px',
        fontWeight: '700',
        background: 'radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)',
        padding: '2rem',
      };
    case 'wave':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 4px 8px rgba(0,0,0,0.5)',
        transform: 'perspective(500px) rotateX(10deg)',
        letterSpacing: '2px',
        animation: 'wave 3s ease-in-out infinite',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
        padding: '1.5rem',
        borderRadius: '20px',
      };
    case 'cinematic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: '6px',
        textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
        fontWeight: '800',
        border: '4px double rgba(255,255,255,0.5)',
        padding: '2rem',
        background: 'rgba(0,0,0,0.4)',
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        opacity: '0.95',
        fontWeight: '600',
        letterSpacing: '2px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)',
        padding: '2rem',
        borderRadius: '8px',
      };
    case 'duotone':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '3px 3px 0px rgba(0,0,0,0.6)',
        letterSpacing: '3px',
        fontWeight: '800',
        mixBlendMode: 'difference',
        padding: '1.5rem',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'contrast(1.2)',
      };
    case 'vignette':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '0 0 20px rgba(255,255,255,0.6), 2px 2px 4px rgba(0,0,0,0.8)',
        letterSpacing: '2px',
        background: 'radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
        padding: '2rem',
        borderRadius: '15px',
      };
    case 'luxury':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        letterSpacing: '5px',
        textTransform: 'uppercase',
        textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
        fontWeight: '300',
        border: '1px solid rgba(255,255,255,0.3)',
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
      };
    default:
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
      };
  }
}