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
        mixBlendMode: 'multiply',
      };
    case 'neon':
      return {
        background: `linear-gradient(45deg, ${darkerColor}${alphaValue} 0%, transparent 100%)`,
        boxShadow: `inset 0 0 100px ${color}${alphaValue}, 0 0 30px ${color}${alphaValue}`,
        backdropFilter: 'blur(4px) brightness(1.2)',
      };
    case 'elegant':
      return {
        background: `linear-gradient(to bottom, transparent 0%, ${darkerColor}${alphaValue} 50%, ${darkerColor}${alphaValue} 100%)`,
        backdropFilter: 'blur(6px) sepia(0.2)',
        boxShadow: `inset 0 0 50px ${color}${alphaValue}`,
      };
    case 'dynamic':
      return {
        background: `linear-gradient(135deg, ${darkerColor}${alphaValue} 0%, transparent 50%, ${color}${alphaValue} 100%)`,
        backdropFilter: 'blur(4px) contrast(1.1)',
        mixBlendMode: 'overlay',
      };
    case 'spotlight':
      return {
        background: `radial-gradient(circle at 30% 30%, transparent 0%, ${darkerColor}${alphaValue} 80%)`,
        backdropFilter: 'blur(8px) brightness(0.9)',
        boxShadow: `inset 0 0 100px ${color}${alphaValue}`,
      };
    case 'wave':
      return {
        background: `
          linear-gradient(180deg, transparent 0%, ${darkerColor}${alphaValue} 70%, ${darkerColor}${alphaValue} 100%),
          repeating-linear-gradient(45deg, ${color}${alphaValue} 0%, transparent 5%, transparent 10%)
        `,
        backdropFilter: 'blur(6px)',
      };
    case 'cinematic':
      return {
        background: `
          linear-gradient(0deg, ${darkerColor}${alphaValue} 0%, transparent 50%, ${darkerColor}${alphaValue} 100%),
          linear-gradient(90deg, ${color}22 1px, transparent 1px),
          linear-gradient(0deg, ${color}22 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 20px 20px, 20px 20px',
        backdropFilter: 'blur(4px) contrast(1.1)',
      };
    case 'minimal-fade':
      return {
        background: `linear-gradient(to top, ${darkerColor}${alphaValue} 0%, transparent 100%)`,
        backdropFilter: 'blur(3px) grayscale(0.3)',
      };
    case 'duotone':
      return {
        background: `linear-gradient(45deg, ${darkerColor}${alphaValue}, ${lighterColor}${alphaValue})`,
        mixBlendMode: 'color',
        backdropFilter: 'contrast(1.2) saturate(1.5)',
      };
    case 'vignette':
      return {
        background: `
          radial-gradient(circle at center, transparent 0%, ${darkerColor}${alphaValue} 120%),
          repeating-radial-gradient(circle at center, ${color}${alphaValue} 0%, transparent 10%, transparent 20%)
        `,
        backdropFilter: 'blur(4px)',
      };
    case 'luxury':
      return {
        background: `
          linear-gradient(45deg, ${color}${alphaValue} 0%, transparent 50%, ${color}${alphaValue} 100%),
          repeating-linear-gradient(-45deg, ${darkerColor}22 0%, ${darkerColor}22 2px, transparent 2px, transparent 8px)
        `,
        backdropFilter: 'blur(6px) brightness(0.95)',
        boxShadow: `inset 0 0 50px ${color}${alphaValue}`,
      };
    default:
      return {
        background: `rgba(255,255,255,${opacity})`,
        backdropFilter: 'blur(8px)',
      };
  }
}