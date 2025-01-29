import { CSSProperties } from "react";

interface AdButtonProps {
  style?: string;
  accentColor: string;
  isHovered: boolean;
  fontFamily: string;
}

export function getButtonStyle({ style = 'minimal', accentColor, isHovered, fontFamily }: AdButtonProps): CSSProperties {
  const baseStyle: CSSProperties = {
    padding: '0.8em 2em',
    fontSize: 'clamp(0.75rem, 1.5vw, 1rem)',
    fontWeight: '600',
    cursor: 'pointer',
    transform: isHovered ? 'translateY(-2px)' : 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5em',
    width: 'auto',
    minWidth: 'min(140px, 35%)',
    maxWidth: '70%',
    minHeight: '2.5em',
    lineHeight: '1',
    fontFamily: fontFamily || 'inherit',
    textAlign: 'center',
    color: '#FFFFFF',
    border: 'none',
    boxShadow: isHovered ? '0 8px 20px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    marginBottom: '1rem',
    zIndex: 10,
  };

  switch (style) {
    case 'modern':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '8px',
        backdropFilter: 'blur(4px)',
        boxShadow: isHovered 
          ? `0 12px 24px ${accentColor}66` 
          : `0 6px 16px ${accentColor}40`,
      };
    case 'neon':
      return {
        ...baseStyle,
        background: `linear-gradient(45deg, ${accentColor}, ${adjustColor(accentColor, 20)})`,
        borderRadius: '12px',
        boxShadow: isHovered 
          ? `0 0 20px ${accentColor}99, 0 0 40px ${accentColor}66` 
          : `0 0 15px ${accentColor}66, 0 0 30px ${accentColor}40`,
      };
    case 'elegant':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '50px',
        padding: '1em 2.5em',
        letterSpacing: '0.5px',
        boxShadow: isHovered 
          ? `0 12px 28px ${accentColor}40` 
          : `0 6px 20px ${accentColor}30`,
      };
    case 'dynamic':
      return {
        ...baseStyle,
        background: accentColor,
        transform: `skew(-5deg) ${isHovered ? 'translateY(-2px)' : 'none'}`,
        borderRadius: '0 12px 12px 0',
        clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)',
        padding: '1em 2.5em',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '50px',
        padding: '1em 2.5em',
        backdropFilter: 'blur(4px)',
      };
    case 'wave':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '20px',
        clipPath: 'polygon(8% 0, 92% 0, 100% 50%, 92% 100%, 8% 100%, 0 50%)',
        padding: '1em 3em',
      };
    case 'cinematic':
      return {
        ...baseStyle,
        background: `linear-gradient(90deg, ${adjustColor(accentColor, -20)}, ${accentColor})`,
        borderRadius: '4px',
        letterSpacing: '1px',
        boxShadow: isHovered 
          ? `0 12px 24px ${accentColor}40` 
          : `0 6px 16px ${accentColor}30`,
      };
    case 'sunset':
      return {
        ...baseStyle,
        background: `linear-gradient(45deg, ${accentColor}, ${adjustColor(accentColor, 20)})`,
        borderRadius: '8px',
        boxShadow: isHovered 
          ? `0 12px 24px ${accentColor}66` 
          : `0 6px 16px ${accentColor}40`,
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        border: `1px solid ${adjustColor(accentColor, 20)}`,
      };
    case 'duotone':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '8px',
        boxShadow: isHovered 
          ? `0 8px 20px ${accentColor}40` 
          : `0 4px 12px ${accentColor}30`,
      };
    case 'vignette':
      return {
        ...baseStyle,
        background: `linear-gradient(90deg, ${adjustColor(accentColor, -10)}, ${accentColor})`,
        borderRadius: '50px',
        padding: '1em 3em',
      };
    case 'luxury':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        boxShadow: isHovered 
          ? `0 12px 24px ${accentColor}40` 
          : `0 6px 16px ${accentColor}30`,
      };
    default:
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '8px',
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
