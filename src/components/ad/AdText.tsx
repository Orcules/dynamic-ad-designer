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
    transition: 'all 0.3s ease',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    hyphens: 'auto',
  };

  switch (style) {
    case 'glitch':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: `
          2px 2px 0 ${accentColor},
          -2px -2px 0 ${accentColor},
          0.1em 0.01em 0.1em rgba(0,0,0,0.5)
        `,
        position: 'relative',
        animation: 'text-shift 4s infinite alternate',
        transform: 'skew(-2deg, -1deg)',
      };
    case 'retro-wave':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: `
          0 0 5px ${accentColor},
          0 0 10px ${accentColor},
          0 0 20px ${accentColor},
          0 0 40px ${accentColor}
        `,
        letterSpacing: '0.15em',
        fontWeight: '800',
      };
    default:
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
      };
  }
}
