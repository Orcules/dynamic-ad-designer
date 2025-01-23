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
        background: `linear-gradient(135deg, ${darkerColor}dd, ${color}dd)`,
        backdropFilter: 'blur(2px)'
      };
    case 'bold':
      return {
        background: `linear-gradient(to right, ${darkerColor}ee, ${color}ee)`,
        backdropFilter: 'blur(4px)'
      };
    case 'elegant':
      return {
        background: `linear-gradient(45deg, ${darkerColor}cc, ${color}cc)`,
        backdropFilter: 'blur(2px)'
      };
    default: // minimal
      return {
        background: `linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.95))`,
        backdropFilter: 'blur(1px)'
      };
  }
}