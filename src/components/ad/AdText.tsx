import { CSSProperties } from "react";

interface AdTextProps {
  style?: string;
  accentColor: string;
  fontFamily: string;
}

export function getTextStyle({ style = 'minimal', accentColor, fontFamily }: AdTextProps): CSSProperties {
  const baseStyle: CSSProperties = {
    transition: 'all 0.4s ease',
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
    textAlign: 'center',
  };

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

  switch (style) {
    case 'modern':
      return {
        ...baseStyle,
        fontWeight: 'bold',
        letterSpacing: '0.05em',
        background: `linear-gradient(45deg, ${adjustColor(accentColor, 30)}, ${adjustColor(accentColor, -30)})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
      };
    case 'bold':
      return {
        ...baseStyle,
        fontWeight: '800',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        background: `linear-gradient(45deg, ${accentColor}, ${adjustColor(accentColor, 20)})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
      };
    case 'elegant':
      return {
        ...baseStyle,
        fontWeight: '500',
        letterSpacing: '0.15em',
        fontStyle: 'italic',
        background: `linear-gradient(45deg, ${accentColor}, ${adjustColor(accentColor, 30)})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
      };
    default: // minimal
      return {
        ...baseStyle,
        color: accentColor,
      };
  }
}