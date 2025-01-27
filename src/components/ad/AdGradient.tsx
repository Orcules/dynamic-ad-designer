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
        background: `linear-gradient(135deg, ${darkerColor}ee 0%, ${color}88 50%, transparent 100%)`,
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(4px)',
      };
    case 'spotlight':
      return {
        background: `radial-gradient(circle at 30% 30%, transparent 0%, ${darkerColor}dd 80%)`,
        position: 'relative',
        backdropFilter: 'blur(8px)',
      };
    case 'wave':
      return {
        background: `linear-gradient(180deg, transparent 0%, ${darkerColor}cc 70%, ${darkerColor}ee 100%)`,
        position: 'relative',
        clipPath: 'polygon(0 0, 100% 0, 100% 90%, 0% 100%)',
        backdropFilter: 'blur(6px)',
      };
    case 'geometric':
      return {
        background: `linear-gradient(120deg, ${darkerColor}ee 0%, ${color}99 50%, transparent 100%)`,
        position: 'relative',
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 25% 100%, 0 85%)',
        backdropFilter: 'blur(4px)',
      };
    default:
      return {
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        position: 'relative',
      };
  }
}