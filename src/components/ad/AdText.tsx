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
  };

  switch (style) {
    case 'modern':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        textShadow: `2px 2px 4px ${accentColor}`,
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
      };
    case 'bold':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '800',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        textShadow: `0 2px 4px rgba(0,0,0,0.3)`,
        position: 'absolute',
        bottom: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
      };
    case 'elegant':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        fontWeight: '500',
        letterSpacing: '0.05em',
        textShadow: `1px 1px 2px ${accentColor}`,
        position: 'absolute',
        left: '10%',
        top: '50%',
        transform: 'translateY(-50%)',
        textAlign: 'left',
        maxWidth: '45%',
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
      };
  }
}