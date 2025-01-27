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
    case 'dynamic':
      return {
        background: `linear-gradient(135deg, ${darkerColor}dd 0%, transparent 75%)`,
        position: 'relative',
        overflow: 'hidden',
      };
    case 'spotlight':
      return {
        background: `radial-gradient(circle at 30% 30%, transparent 0%, ${darkerColor}cc 70%)`,
        position: 'relative',
      };
    case 'wave':
      return {
        background: `linear-gradient(180deg, transparent 0%, ${darkerColor}aa 100%)`,
        position: 'relative',
        clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0% 100%)',
      };
    case 'geometric':
      return {
        background: `linear-gradient(120deg, ${darkerColor}ee 0%, transparent 100%)`,
        position: 'relative',
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 30% 100%, 0 85%)',
      };
    default:
      return {
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(4px)',
        position: 'relative',
      };
  }
}