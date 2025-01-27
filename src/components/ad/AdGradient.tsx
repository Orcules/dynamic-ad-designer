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
  const lighterColor = adjustColor(color, 20);

  switch (style) {
    case 'modern':
      return {
        background: `linear-gradient(135deg, transparent 15%, ${darkerColor}dd 15%)`,
        position: 'relative',
      };
    case 'bold':
      return {
        background: `linear-gradient(180deg, 
          rgba(0,0,0,0.4) 0%,
          transparent 30%,
          ${darkerColor}99 100%)`,
        position: 'relative',
      };
    case 'elegant':
      return {
        background: `linear-gradient(90deg, ${darkerColor}ee, transparent 70%)`,
        position: 'relative',
      };
    default: // minimal
      return {
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(4px)',
        position: 'relative',
      };
  }
}