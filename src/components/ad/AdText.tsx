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
        textShadow: '2px 2px 15px rgba(0,0,0,0.4)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.15) 100%)',
        padding: '2rem',
        borderRadius: '12px',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.2)',
      };
    case 'elegant':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
        letterSpacing: '0.05em',
        background: 'linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.2))',
        padding: '2.5rem',
        border: '2px solid rgba(255,255,255,0.15)',
        borderRadius: '4px',
      };
    case 'dynamic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '3px 3px 10px rgba(0,0,0,0.5)',
        transform: 'skew(-5deg)',
        background: 'linear-gradient(45deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)',
        padding: '2rem',
        border: '3px solid rgba(255,255,255,0.2)',
        borderRadius: '8px',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 20px rgba(0,0,0,0.6)',
        background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.7) 100%)',
        padding: '3rem',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
      };
    case 'wave':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 12px rgba(0,0,0,0.4)',
        background: 'linear-gradient(45deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 100%)',
        padding: '2.5rem',
        borderLeft: '6px solid rgba(255,255,255,0.3)',
        borderRadius: '0 8px 8px 0',
      };
    case 'cinematic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '3px 3px 15px rgba(0,0,0,0.6)',
        letterSpacing: '0.1em',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.4))',
        padding: '2.5rem',
        border: '4px double rgba(255,255,255,0.2)',
        backdropFilter: 'blur(6px)',
        borderRadius: '2px',
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '1px 1px 8px rgba(0,0,0,0.3)',
        background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
        padding: '2.5rem',
        backdropFilter: 'blur(3px)',
        borderBottom: '2px solid rgba(255,255,255,0.2)',
      };
    case 'duotone':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 12px rgba(0,0,0,0.5)',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%)',
        padding: '2.5rem',
        border: '3px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(5px)',
        borderRadius: '20px',
      };
    case 'vignette':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 15px rgba(0,0,0,0.5)',
        background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 120%)',
        padding: '2.5rem',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
      };
    case 'luxury':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 10px rgba(0,0,0,0.4)',
        letterSpacing: '0.08em',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)',
        padding: '2.5rem',
        border: '2px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(6px)',
        borderRadius: '6px',
      };
    default:
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '1px 1px 8px rgba(0,0,0,0.3)',
        background: 'rgba(0,0,0,0.4)',
        padding: '2rem',
        backdropFilter: 'blur(4px)',
      };
  }
}