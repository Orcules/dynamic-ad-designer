import { CSSProperties } from "react";

interface AdTextProps {
  style?: string;
  accentColor: string;
  fontFamily: string;
}

export function getTextStyle({ style = 'minimal', accentColor, fontFamily }: AdTextProps): CSSProperties {
  const baseStyle: CSSProperties = {
    fontWeight: 'bold',
    fontSize: 'clamp(1.2rem, 4vw, 2.8rem)',
    lineHeight: '1.4',
    maxWidth: '90%',
    margin: '0 auto',
    padding: '1rem',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
    fontFamily: fontFamily || 'inherit',
  };

  switch (style) {
    case 'modern':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%) rotate(-2deg)',
        textAlign: 'center',
        background: `linear-gradient(135deg, ${accentColor}ee, ${accentColor}99)`,
        borderRadius: '8px',
        padding: '1.5rem 2rem',
        maxWidth: '85%',
      };
    case 'bold':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '800',
        letterSpacing: '0.05em',
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        background: 'rgba(0,0,0,0.6)',
        borderRadius: '16px',
        padding: '2rem',
        backdropFilter: 'blur(8px)',
        maxWidth: '80%',
      };
    case 'elegant':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '500',
        letterSpacing: '0.05em',
        position: 'absolute',
        left: '8%',
        top: '50%',
        transform: 'translateY(-50%)',
        textAlign: 'left',
        maxWidth: '55%',
        background: `linear-gradient(90deg, ${accentColor}dd, transparent)`,
        borderRadius: '0 50px 50px 0',
        padding: '2.5rem 3rem 2.5rem 2rem',
      };
    default: // minimal
      return {
        ...baseStyle,
        color: '#000000',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '12px',
        padding: '2rem',
        backdropFilter: 'blur(4px)',
        maxWidth: '75%',
      };
  }
}