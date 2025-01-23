import { CSSProperties } from "react";

interface AdButtonProps {
  style?: string;
  accentColor: string;
  isHovered: boolean;
  fontFamily: string;
}

export function getButtonStyle({ style = 'minimal', accentColor, isHovered, fontFamily }: AdButtonProps): CSSProperties {
  const baseStyle: CSSProperties = {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    padding: '0.8em 2em',
    fontSize: 'clamp(0.75rem, 1.5vw, 1.1rem)',
    fontWeight: '600',
    borderRadius: '9999px',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    isolation: 'isolate',
    maxWidth: '90%',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'auto',
    minWidth: 'min(200px, 50%)',
    minHeight: '2.5em',
    lineHeight: '1.2',
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
        background: `linear-gradient(135deg, ${adjustColor(accentColor, 30)}, ${accentColor}, ${adjustColor(accentColor, -30)})`,
        boxShadow: isHovered 
          ? `0 6px 20px ${adjustColor(accentColor, -30)}90`
          : `0 4px 15px ${adjustColor(accentColor, -30)}80`,
        border: '2px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(5px)',
      };
    case 'bold':
      return {
        ...baseStyle,
        background: `linear-gradient(45deg, ${accentColor}, ${adjustColor(accentColor, 20)})`,
        boxShadow: isHovered 
          ? `0 8px 25px ${adjustColor(accentColor, -30)}90`
          : `0 6px 20px ${adjustColor(accentColor, -30)}80`,
        transform: isHovered ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
      };
    case 'elegant':
      return {
        ...baseStyle,
        background: isHovered 
          ? `linear-gradient(to right, ${accentColor}, ${adjustColor(accentColor, 20)})`
          : `linear-gradient(to right, ${adjustColor(accentColor, 20)}, ${accentColor})`,
        boxShadow: isHovered 
          ? `0 4px 15px ${adjustColor(accentColor, -30)}50`
          : `0 2px 10px ${adjustColor(accentColor, -30)}40`,
        border: `2px solid ${adjustColor(accentColor, 30)}`,
      };
    default: // minimal
      return {
        ...baseStyle,
        background: accentColor,
        boxShadow: isHovered 
          ? `0 4px 10px ${adjustColor(accentColor, -30)}50`
          : `0 2px 5px ${adjustColor(accentColor, -30)}40`,
      };
  }
}