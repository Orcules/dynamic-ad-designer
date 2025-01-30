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
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
        letterSpacing: '0.5px',
        transform: 'perspective(500px) translateZ(0)',
        animation: 'float 6s ease-in-out infinite',
      };
    case 'neon':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}, 0 0 30px ${accentColor}`,
        letterSpacing: '2px',
        animation: 'pulse 2s ease-in-out infinite',
      };
    case 'elegant':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '600',
        letterSpacing: '1px',
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
        borderBottom: '2px solid rgba(255,255,255,0.3)',
        paddingBottom: '1rem',
      };
    case 'dynamic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        transform: 'skew(-5deg)',
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
        background: `linear-gradient(45deg, #fff, ${accentColor})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
        animation: 'spotlight 8s ease-in-out infinite',
        background: `linear-gradient(90deg, rgba(255,255,255,0.8), #fff, rgba(255,255,255,0.8))`,
        WebkitBackgroundClip: 'text',
        backgroundSize: '200% auto',
      };
    case 'wave':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '1px 1px 4px rgba(0,0,0,0.2)',
        animation: 'wave 3s ease-in-out infinite',
        background: `linear-gradient(-45deg, #fff, ${accentColor}, #fff)`,
        WebkitBackgroundClip: 'text',
        backgroundSize: '200% auto',
      };
    case 'cinematic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        textShadow: `0 0 10px rgba(255,255,255,0.5), 0 0 20px ${accentColor}`,
        animation: 'flicker 3s linear infinite',
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        opacity: '0.9',
        letterSpacing: '1px',
        backdropFilter: 'blur(4px)',
        padding: '1rem',
        background: 'rgba(0,0,0,0.1)',
        borderRadius: '8px',
      };
    case 'duotone':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        mixBlendMode: 'difference',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        letterSpacing: '2px',
        transform: 'scale(1.02)',
      };
    case 'vignette':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: `0 0 15px ${accentColor}`,
        letterSpacing: '1px',
        background: `linear-gradient(90deg, transparent, #fff, transparent)`,
        WebkitBackgroundClip: 'text',
        animation: 'shine 3s linear infinite',
      };
    case 'luxury':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontSize: 'clamp(1.2rem, 3vw, 2rem)',
        fontWeight: '600',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        textShadow: `2px 2px 4px rgba(0,0,0,0.2), 0 0 10px ${accentColor}`,
        borderLeft: '3px solid rgba(255,255,255,0.3)',
        borderRight: '3px solid rgba(255,255,255,0.3)',
        padding: '1rem 2rem',
      };
    default:
      return {
        ...baseStyle,
        color: '#000000',
      };
  }
}