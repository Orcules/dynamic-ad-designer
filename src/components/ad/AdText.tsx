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
    case 'neon':
      return {
        ...baseStyle,
        color: '#d9fdff',
        textShadow: `0 0 2rem ${accentColor}, 0 0 1rem ${accentColor}`,
        letterSpacing: '0.05em',
      };

    case 'split':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: `
          2px 2px 0 ${accentColor},
          -2px -2px 0 ${accentColor}
        `,
        letterSpacing: '-0.02em',
      };

    case 'gradient':
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${accentColor} 0%, #ffffff 50%, ${accentColor} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: 'none',
      };

    case 'outline':
      return {
        ...baseStyle,
        color: 'transparent',
        WebkitTextStroke: `2px ${accentColor}`,
        textShadow: `3px 3px 0 ${accentColor}`,
        letterSpacing: '0.02em',
      };

    case 'stacked':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: `
          0 1px 0 ${accentColor},
          0 2px 0 ${accentColor},
          0 3px 0 ${accentColor},
          0 4px 0 ${accentColor},
          0 5px 0 ${accentColor}
        `,
      };

    default:
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
      };
  }
}