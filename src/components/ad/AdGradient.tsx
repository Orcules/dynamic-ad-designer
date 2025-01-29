import { CSSProperties } from "react";

interface AdGradientProps {
  style?: string;
  color: string;
  opacity?: number;
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

export function AdGradient({ style = 'minimal', color, opacity = 0.4 }: AdGradientProps): CSSProperties {
  const darkerColor = adjustColor(color, -20);
  const lighterColor = adjustColor(color, 20);
  const alphaValue = Math.round(opacity * 255).toString(16).padStart(2, '0');

  switch (style) {
    case 'modern':
      return {
        background: `linear-gradient(135deg, ${color}${alphaValue} 0%, ${darkerColor}${alphaValue} 100%)`,
        backdropFilter: 'blur(8px)',
      };
    case 'neon':
      return {
        background: `linear-gradient(45deg, ${darkerColor}${alphaValue} 0%, transparent 100%)`,
        boxShadow: `inset 0 0 100px ${color}${alphaValue}`,
        backdropFilter: 'blur(4px)',
      };
    case 'elegant':
      return {
        background: `linear-gradient(to bottom, transparent 0%, ${darkerColor}${alphaValue} 50%, ${darkerColor}${alphaValue} 100%)`,
        backdropFilter: 'blur(6px)',
      };
    case 'dynamic':
      return {
        background: `linear-gradient(135deg, ${darkerColor}${alphaValue} 0%, ${color}${alphaValue} 50%, transparent 100%)`,
        backdropFilter: 'blur(4px)',
      };
    case 'spotlight':
      return {
        background: `radial-gradient(circle at 30% 30%, transparent 0%, ${darkerColor}${alphaValue} 80%)`,
        backdropFilter: 'blur(8px)',
      };
    case 'wave':
      return {
        background: `linear-gradient(180deg, transparent 0%, ${darkerColor}${alphaValue} 70%, ${darkerColor}${alphaValue} 100%)`,
        backdropFilter: 'blur(6px)',
      };
    case 'cinematic':
      return {
        background: `linear-gradient(0deg, ${darkerColor}${alphaValue} 0%, transparent 50%, ${darkerColor}${alphaValue} 100%)`,
        backdropFilter: 'blur(4px)',
      };
    case 'sunset':
      return {
        background: `linear-gradient(180deg, ${lighterColor}${alphaValue} 0%, ${color}${alphaValue} 50%, ${darkerColor}${alphaValue} 100%)`,
        backdropFilter: 'blur(5px)',
      };
    case 'minimal-fade':
      return {
        background: `linear-gradient(to top, ${darkerColor}${alphaValue} 0%, transparent 100%)`,
        backdropFilter: 'blur(3px)',
      };
    case 'duotone':
      return {
        background: `linear-gradient(45deg, ${darkerColor}${alphaValue}, ${lighterColor}${alphaValue})`,
        mixBlendMode: 'color',
      };
    case 'vignette':
      return {
        background: `radial-gradient(circle at center, transparent 0%, ${darkerColor}${alphaValue} 120%)`,
        backdropFilter: 'blur(4px)',
      };
    case 'luxury':
      return {
        background: `rgba(0, 0, 0, ${opacity})`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '2rem',
      };
    default:
      return {
        background: `rgba(255,255,255,${opacity})`,
        backdropFilter: 'blur(8px)',
      };
  }
}