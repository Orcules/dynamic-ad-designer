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
        fontSize: 'clamp(3rem, 8vw, 5rem)',
        fontWeight: '900',
        textTransform: 'uppercase',
        textShadow: `
          2px 2px 0 #000,
          -2px -2px 0 #000,
          4px 4px 0 rgba(0,0,0,0.8),
          0 0 20px rgba(0,0,0,0.9)
        `,
        background: 'rgba(0,0,0,0.7)',
        padding: '2rem',
        borderRadius: '12px',
        border: '4px solid rgba(255,255,255,0.8)',
        boxShadow: '0 0 30px rgba(0,0,0,0.8)',
      };
    case 'elegant':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
        fontWeight: '800',
        letterSpacing: '0.05em',
        textShadow: `
          2px 2px 4px rgba(0,0,0,0.9),
          0 0 40px rgba(0,0,0,0.8)
        `,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)',
        padding: '2.5rem',
        backdropFilter: 'blur(10px)',
        border: '3px solid rgba(255,255,255,0.3)',
      };
    case 'dynamic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontSize: 'clamp(3rem, 8vw, 5rem)',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        textShadow: `
          3px 3px 0 rgba(0,0,0,0.8),
          6px 6px 0 rgba(0,0,0,0.6),
          0 0 20px rgba(0,0,0,0.9)
        `,
        background: 'rgba(0,0,0,0.75)',
        padding: '2rem 3rem',
        border: '5px solid #FFFFFF',
        boxShadow: '0 0 40px rgba(0,0,0,0.8)',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontSize: 'clamp(3.5rem, 9vw, 5.5rem)',
        fontWeight: '800',
        letterSpacing: '0.03em',
        textShadow: `
          2px 2px 4px rgba(0,0,0,1),
          0 0 60px rgba(255,255,255,0.5)
        `,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        padding: '3rem',
        borderRadius: '20px',
        border: '4px solid rgba(255,255,255,0.5)',
      };
    case 'wave':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontSize: 'clamp(3rem, 8vw, 5rem)',
        fontWeight: '900',
        letterSpacing: '0.04em',
        textShadow: `
          4px 4px 0 rgba(0,0,0,0.9),
          -4px -4px 0 rgba(0,0,0,0.9),
          0 0 30px rgba(0,0,0,0.8)
        `,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)',
        padding: '2.5rem',
        border: '6px solid rgba(255,255,255,0.7)',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)',
      };
    case 'cinematic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontSize: 'clamp(3.5rem, 9vw, 5.5rem)',
        fontWeight: '800',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        textShadow: `
          3px 3px 6px rgba(0,0,0,1),
          0 0 40px rgba(0,0,0,0.9)
        `,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 100%)',
        padding: '3rem',
        border: '8px double rgba(255,255,255,0.9)',
        boxShadow: '0 0 50px rgba(0,0,0,0.8)',
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontSize: 'clamp(3rem, 8vw, 5rem)',
        fontWeight: '700',
        letterSpacing: '0.03em',
        textShadow: `
          2px 2px 4px rgba(0,0,0,1),
          0 0 30px rgba(0,0,0,0.9)
        `,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)',
        padding: '2.5rem',
        borderRadius: '16px',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 0 40px rgba(0,0,0,0.7)',
      };
    case 'duotone':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontSize: 'clamp(3.5rem, 9vw, 5.5rem)',
        fontWeight: '900',
        letterSpacing: '0.04em',
        textShadow: `
          4px 4px 0 rgba(0,0,0,1),
          0 0 40px rgba(0,0,0,0.9)
        `,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 100%)',
        padding: '3rem',
        border: '5px solid #FFFFFF',
        borderRadius: '24px',
        boxShadow: 'inset 0 0 60px rgba(0,0,0,0.8)',
      };
    case 'vignette':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontSize: 'clamp(3rem, 8vw, 5rem)',
        fontWeight: '800',
        letterSpacing: '0.03em',
        textShadow: `
          3px 3px 6px rgba(0,0,0,1),
          0 0 50px rgba(0,0,0,0.9)
        `,
        background: 'radial-gradient(circle at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.95) 100%)',
        padding: '3rem',
        borderRadius: '28px',
        border: '4px solid rgba(255,255,255,0.6)',
        boxShadow: '0 0 60px rgba(0,0,0,0.9)',
      };
    case 'luxury':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontSize: 'clamp(3.5rem, 9vw, 5.5rem)',
        fontWeight: '700',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        textShadow: `
          2px 2px 4px rgba(0,0,0,1),
          0 0 40px rgba(0,0,0,0.8)
        `,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 100%)',
        padding: '3rem',
        border: '3px solid rgba(255,255,255,0.8)',
        borderRadius: '8px',
        boxShadow: '0 0 50px rgba(0,0,0,0.8)',
      };
    default:
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: `
          2px 2px 4px rgba(0,0,0,1),
          0 0 30px rgba(0,0,0,0.9)
        `,
        background: 'rgba(0,0,0,0.8)',
        padding: '2.5rem',
        boxShadow: '0 0 40px rgba(0,0,0,0.8)',
      };
  }
}