
import { CSSProperties } from "react";

interface AdTextProps {
  style?: string;
  accentColor: string;
  textColor: string;
  fontFamily: string;
  fontSize?: string;
  isDescription?: boolean;
  isRTL?: boolean;
}

export function getTextStyle({ 
  style = 'minimal', 
  accentColor, 
  textColor, 
  fontFamily, 
  fontSize, 
  isDescription = false,
  isRTL = false
}: AdTextProps): CSSProperties {
  // Ensure we have a valid style
  const safeStyle = style && style.trim() ? style : 'minimal';
  
  const baseStyle: CSSProperties = {
    fontWeight: isDescription ? 'normal' : 'bold',
    fontSize: fontSize || (isDescription ? 'clamp(0.875rem, 2.5vw, 1.25rem)' : 'clamp(1.25rem, 4vw, 2.5rem)'),
    lineHeight: isDescription ? '1.6' : '1.3',
    maxWidth: '100%',
    margin: '0 auto',
    padding: isDescription ? '0.75rem' : '1rem',
    fontFamily: fontFamily || 'system-ui',
    textAlign: 'center',
    display: 'block',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    hyphens: 'auto',
    color: textColor,
    position: 'relative',
    zIndex: isDescription ? 2 : 3,
    direction: isRTL ? 'rtl' : 'ltr',
  };

  // Use the safe style value for switch
  switch (safeStyle) {
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
        textTransform: 'uppercase',
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
        letterSpacing: '0.05em',
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
        fontWeight: '300',
      };

    case 'retro':
      return {
        ...baseStyle,
        textShadow: `2px 2px 0 ${accentColor}, 4px 4px 0 rgba(0,0,0,0.2)`,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
      };

    case 'glassmorphism':
      return {
        ...baseStyle,
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: '1.5rem',
        borderRadius: '8px',
      };

    case '3d':
      return {
        ...baseStyle,
        textShadow: `0 1px 0 #ccc,
                     0 2px 0 #c9c9c9,
                     0 3px 0 #bbb,
                     0 4px 0 #b9b9b9,
                     0 5px 0 #aaa,
                     0 6px 1px rgba(0,0,0,.1),
                     0 0 5px rgba(0,0,0,.1),
                     0 1px 3px rgba(0,0,0,.3),
                     0 3px 5px rgba(0,0,0,.2),
                     0 5px 10px rgba(0,0,0,.25)`,
      };

    case 'vintage':
      return {
        ...baseStyle,
        textShadow: `2px 2px 0 ${accentColor}`,
        letterSpacing: '0.2em',
        fontFamily: "'Georgia', serif",
      };

    case 'tech':
      return {
        ...baseStyle,
        textShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}, 0 0 30px ${accentColor}`,
        letterSpacing: '0.1em',
        fontFamily: "'Courier New', monospace",
      };

    case 'nature':
      return {
        ...baseStyle,
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        letterSpacing: '0.05em',
        fontFamily: "'Verdana', sans-serif",
      };

    case 'urban':
      return {
        ...baseStyle,
        textShadow: `1px 1px 0 ${accentColor}, -1px -1px 0 ${accentColor}`,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      };

    case 'artistic':
      return {
        ...baseStyle,
        textShadow: `2px 2px 0 ${accentColor}, 
                     4px 4px 0 rgba(0,0,0,0.2)`,
        fontStyle: 'italic',
        letterSpacing: '0.05em',
      };

    default:
      return baseStyle;
  }
}
