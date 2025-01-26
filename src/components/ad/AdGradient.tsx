import { CSSProperties } from "react";

interface AdGradientProps {
  style?: string;
  color: string;
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

export function AdGradient({ style = 'minimal', color }: AdGradientProps): CSSProperties {
  const darkerColor = adjustColor(color, -20);
  const transparentColor = `${color}80`;

  switch (style) {
    case 'modern':
      return {
        background: `linear-gradient(135deg, ${darkerColor}dd, transparent)`,
        backdropFilter: 'blur(2px)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at top right, transparent, ${color}aa)`,
        }
      };
    case 'bold':
      return {
        background: `linear-gradient(to bottom, transparent, ${darkerColor}ee)`,
        backdropFilter: 'blur(4px)',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '60%',
          background: `linear-gradient(to top, ${color}ee, transparent)`,
        }
      };
    case 'elegant':
      return {
        background: `linear-gradient(45deg, ${darkerColor}ee, transparent)`,
        backdropFilter: 'blur(2px)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(to right, ${color}cc, transparent)`,
        }
      };
    default: // minimal
      return {
        background: `linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.95))`,
        backdropFilter: 'blur(1px)'
      };
  }
}