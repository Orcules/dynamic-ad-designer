import { CSSProperties } from "react";

interface AdTextProps {
  style?: string;
  accentColor: string;
  textColor: string;
  fontFamily: string;
  fontSize?: string;
  isDescription?: boolean;
}

export function getTextStyle({ style = 'minimal', accentColor, textColor, fontFamily, fontSize, isDescription = false }: AdTextProps): CSSProperties {
  const baseStyle: CSSProperties = {
    fontWeight: isDescription ? 'normal' : 'bold',
    fontSize: fontSize || (isDescription ? '1.125rem' : 'clamp(1.5rem, 3vw, 2.5rem)'),
    lineHeight: isDescription ? '1.6' : '1.3',
    maxWidth: '100%',
    margin: '0 auto',
    padding: isDescription ? '0.75rem' : '1rem',
    fontFamily: fontFamily || 'Montserrat, system-ui',
    textAlign: 'center',
    display: 'block',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    hyphens: 'auto',
    color: textColor,
    position: 'relative',
    zIndex: isDescription ? 2 : 3,
  };

  switch (style) {
    case 'modern':
      return {
        ...baseStyle,
        textShadow: `2px 2px 4px ${accentColor}`,
      };

    case 'elegant':
      return {
        ...baseStyle,
        textShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}`,
        letterSpacing: '0.05em',
      };

    case 'dynamic':
      return {
        ...baseStyle,
        textShadow: '2px 2px 0 #FFFFFF',
        transform: 'skew(-5deg)',
      };

    case 'spotlight':
      return {
        ...baseStyle,
        textShadow: `0 0 15px ${accentColor}`,
        letterSpacing: '0.02em',
      };

    case 'wave':
      return {
        ...baseStyle,
        textShadow: `2px 2px 0 ${accentColor}, -2px -2px 0 ${accentColor}`,
        transform: 'rotate(-2deg)',
      };

    case 'cinematic':
      return {
        ...baseStyle,
        textShadow: `0 0 20px ${accentColor}`,
        letterSpacing: '0.1em',
      };

    case 'minimal-fade':
      return {
        ...baseStyle,
        opacity: 0.9,
      };

    case 'duotone':
      return {
        ...baseStyle,
        textShadow: `3px 3px 0 ${accentColor}`,
      };

    case 'vignette':
      return {
        ...baseStyle,
        textShadow: `0 0 30px ${accentColor}`,
      };

    case 'luxury':
      return {
        ...baseStyle,
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        letterSpacing: '0.1em',
      };

    case 'overlay-bottom-clean':
      return {
        ...baseStyle,
        backgroundColor: `${accentColor}CC`,
        padding: '2rem',
        width: '100%',
        maxWidth: '100%',
        margin: 0,
        position: 'absolute',
        bottom: 0,
        left: 0,
        backdropFilter: 'blur(8px)',
      };

    case 'overlay-bottom-gradient':
      return {
        ...baseStyle,
        background: `linear-gradient(to top, ${accentColor} 0%, ${accentColor}99 60%, transparent 100%)`,
        padding: '4rem 2rem 2rem',
        width: '100%',
        maxWidth: '100%',
        margin: 0,
        position: 'absolute',
        bottom: 0,
        left: 0,
      };

    case 'overlay-bottom-glass':
      return {
        ...baseStyle,
        backgroundColor: `${accentColor}88`,
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.2)',
        padding: '2rem',
        width: '100%',
        maxWidth: '100%',
        margin: 0,
        position: 'absolute',
        bottom: 0,
        left: 0,
      };

    case 'overlay-bottom-neon':
      return {
        ...baseStyle,
        textShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}`,
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: '2rem',
        width: '100%',
        maxWidth: '100%',
        margin: 0,
        position: 'absolute',
        bottom: 0,
        left: 0,
      };

    case 'overlay-bottom-minimal':
      return {
        ...baseStyle,
        backgroundColor: '#00000099',
        padding: '2rem',
        width: '100%',
        maxWidth: '100%',
        margin: 0,
        position: 'absolute',
        bottom: 0,
        left: 0,
      };

    default:
      return baseStyle;
  }
}
