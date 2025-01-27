import { CSSProperties } from "react";

interface AdTextProps {
  style?: string;
  accentColor: string;
  fontFamily: string;
}

export function getTextStyle({ style = 'minimal', accentColor, fontFamily }: AdTextProps): CSSProperties {
  const baseStyle: CSSProperties = {
    fontWeight: 'bold',
    fontSize: 'min(4vw, min(2.5rem, max(1rem, calc(100vw / 30))))',
    lineHeight: '1.2',
    maxWidth: '85%',
    margin: '0 auto',
    padding: '1rem',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    fontFamily: fontFamily || 'inherit',
    textAlign: 'center',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  switch (style) {
    case 'dynamic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        background: `linear-gradient(135deg, ${accentColor}ee, ${accentColor}99)`,
        borderRadius: '16px',
        padding: '1.5rem',
        maxWidth: '80%',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(8px)',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        position: 'absolute',
        top: '25%',
        left: '50%',
        transform: 'translateX(-50%)',
        background: `${accentColor}dd`,
        borderRadius: '20px',
        padding: '1.5rem',
        maxWidth: '75%',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      };
    case 'wave':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        background: `${accentColor}cc`,
        borderRadius: '30px',
        padding: '1.5rem 2rem',
        maxWidth: '80%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      };
    case 'geometric':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        background: `${accentColor}dd`,
        clipPath: 'polygon(5% 0, 95% 0, 100% 85%, 95% 100%, 5% 100%, 0 85%)',
        padding: '2rem',
        maxWidth: '75%',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      };
    default:
      return {
        ...baseStyle,
        color: '#000000',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '12px',
        padding: '1.5rem',
        maxWidth: '75%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      };
  }
}