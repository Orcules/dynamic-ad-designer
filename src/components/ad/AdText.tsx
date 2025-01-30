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
    fontFamily: fontFamily || 'Montserrat, system-ui',
    textAlign: 'center',
    display: 'block',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    hyphens: 'auto',
  };

  switch (style) {
    // Previous Styles
    case 'modern':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: `2px 2px 4px ${accentColor}`,
      };

    case 'elegant':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}`,
        letterSpacing: '0.05em',
      };

    case 'dynamic':
      return {
        ...baseStyle,
        color: accentColor,
        textShadow: '2px 2px 0 #FFFFFF',
        transform: 'skew(-5deg)',
      };

    case 'spotlight':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: `0 0 15px ${accentColor}`,
        letterSpacing: '0.02em',
      };

    case 'wave':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: `2px 2px 0 ${accentColor}, -2px -2px 0 ${accentColor}`,
        transform: 'rotate(-2deg)',
      };

    case 'cinematic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: `0 0 20px ${accentColor}`,
        letterSpacing: '0.1em',
      };

    case 'minimal-fade':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        opacity: 0.9,
      };

    case 'duotone':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: `3px 3px 0 ${accentColor}`,
      };

    case 'vignette':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: `0 0 30px ${accentColor}`,
      };

    case 'luxury':
      return {
        ...baseStyle,
        color: accentColor,
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        letterSpacing: '0.1em',
      };

    // New Bottom Overlay Styles
    case 'overlay-bottom-clean':
      return {
        ...baseStyle,
        color: '#FFFFFF',
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
        color: '#FFFFFF',
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
        color: '#FFFFFF',
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
        color: '#d9fdff',
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
        color: '#FFFFFF',
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
      return {
        ...baseStyle,
        color: '#000000',
        textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
      };
  }
}
