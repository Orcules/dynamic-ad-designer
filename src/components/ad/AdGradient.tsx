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
        background: `linear-gradient(135deg, ${color}88 0%, ${darkerColor}99 100%)`,
        backdropFilter: 'blur(8px)',
      };
    case 'neon':
      return {
        background: `linear-gradient(45deg, ${darkerColor}88 0%, transparent 100%)`,
        boxShadow: `inset 0 0 100px ${color}44`,
        backdropFilter: 'blur(4px)',
      };
    case 'elegant':
      return {
        background: `linear-gradient(to bottom, transparent 0%, ${darkerColor}88 50%, ${darkerColor}aa 100%)`,
        backdropFilter: 'blur(6px)',
      };
    case 'dynamic':
      return {
        background: `linear-gradient(135deg, ${darkerColor}88 0%, ${color}66 50%, transparent 100%)`,
        backdropFilter: 'blur(4px)',
      };
    case 'spotlight':
      return {
        background: `radial-gradient(circle at 30% 30%, transparent 0%, ${darkerColor}99 80%)`,
        backdropFilter: 'blur(8px)',
      };
    case 'wave':
      return {
        background: `linear-gradient(180deg, transparent 0%, ${darkerColor}88 70%, ${darkerColor}aa 100%)`,
        backdropFilter: 'blur(6px)',
      };
    case 'cinematic':
      return {
        background: `linear-gradient(0deg, ${darkerColor}aa 0%, transparent 50%, ${darkerColor}88 100%)`,
        backdropFilter: 'blur(4px)',
      };
    case 'sunset':
      return {
        background: `linear-gradient(180deg, ${lighterColor}66 0%, ${color}77 50%, ${darkerColor}aa 100%)`,
        backdropFilter: 'blur(5px)',
      };
    case 'minimal-fade':
      return {
        background: `linear-gradient(to top, ${darkerColor}aa 0%, transparent 100%)`,
        backdropFilter: 'blur(3px)',
      };
    case 'duotone':
      return {
        background: `linear-gradient(45deg, ${darkerColor}88, ${lighterColor}88)`,
        mixBlendMode: 'color',
      };
    case 'vignette':
      return {
        background: `radial-gradient(circle at center, transparent 0%, ${darkerColor}aa 120%)`,
        backdropFilter: 'blur(4px)',
      };
    default:
      return {
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
      };
  }
}