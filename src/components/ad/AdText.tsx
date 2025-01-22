import { CSSProperties } from "react";

interface AdTextProps {
  style?: string;
  accentColor: string;
  fontFamily: string;
}

export function getTextStyle({ style = 'minimal', accentColor, fontFamily }: AdTextProps): CSSProperties {
  const baseStyle: CSSProperties = {
    transition: 'all 0.4s ease',
    textShadow: 'none',
    fontWeight: 'normal',
    letterSpacing: 'normal',
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
        textShadow: '2px 2px 4px rgba(0,0,0,0.2), -1px -1px 1px rgba(255,255,255,0.1)',
        fontWeight: 'bold',
        letterSpacing: '0.05em',
        background: `linear-gradient(45deg, ${adjustColor(accentColor, 30)}, ${adjustColor(accentColor, -30)})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
      };
    case 'bold':
      return {
        ...baseStyle,
        textShadow: '3px 3px 6px rgba(0,0,0,0.3), -1px -1px 2px rgba(255,255,255,0.1)',
        fontWeight: '800',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        textAlign: 'center',
      };
    case 'elegant':
      return {
        ...baseStyle,
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
        fontWeight: '500',
        letterSpacing: '0.15em',
        fontStyle: 'italic',
        textAlign: 'center',
      };
    default: // minimal
      return {
        ...baseStyle,
        textAlign: 'center',
      };
  }
}

function adjustColor(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1)}`;
}