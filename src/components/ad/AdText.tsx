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
    lineHeight: '1.3',
    maxWidth: '85%',
    margin: '0 auto',
    padding: '0.5em',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontFamily: fontFamily || 'inherit',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
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
        padding: '1em 2em',
        maxWidth: '90%',
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
        padding: '1.5em',
        backdropFilter: 'blur(8px)',
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
        maxWidth: '45%',
        background: `linear-gradient(90deg, ${accentColor}dd, transparent)`,
        borderRadius: '0 50px 50px 0',
        padding: '2em 3em 2em 2em',
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
        padding: '1.5em',
        backdropFilter: 'blur(4px)',
      };
  }
}