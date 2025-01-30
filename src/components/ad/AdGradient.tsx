import { CSSProperties } from "react";

interface AdGradientProps {
  style?: string;
  color: string;
  opacity?: number;
}

export function AdGradient({ style = 'minimal', color, opacity = 0.4 }: AdGradientProps): CSSProperties {
  const alphaValue = Math.round(opacity * 255).toString(16).padStart(2, '0');

  switch (style) {
    case 'modern':
      return {
        background: `linear-gradient(135deg, ${color}${alphaValue} 0%, transparent 60%, ${color}${alphaValue} 100%)`,
      };
    case 'elegant':
      return {
        background: `linear-gradient(180deg, ${color}${alphaValue} 0%, transparent 35%, ${color}${alphaValue} 100%)`,
      };
    case 'dynamic':
      return {
        background: `linear-gradient(45deg, transparent 0%, ${color}${alphaValue} 50%, transparent 100%)`,
      };
    case 'spotlight':
      return {
        background: `radial-gradient(circle at 50% 50%, transparent 0%, ${color}${alphaValue} 100%)`,
      };
    case 'wave':
      return {
        background: `linear-gradient(45deg, ${color}${alphaValue} 0%, transparent 45%, ${color}${alphaValue} 55%, transparent 100%)`,
      };
    case 'cinematic':
      return {
        background: `linear-gradient(to bottom, ${color}${alphaValue} 0%, transparent 40%, transparent 60%, ${color}${alphaValue} 100%)`,
      };
    case 'minimal-fade':
      return {
        background: `linear-gradient(to top, ${color}${alphaValue} 0%, transparent 100%)`,
      };
    case 'duotone':
      return {
        background: `linear-gradient(135deg, ${color}${alphaValue} 0%, transparent 50%, ${color}${alphaValue}99 100%)`,
      };
    case 'vignette':
      return {
        background: `radial-gradient(circle at 50% 50%, transparent 0%, ${color}${alphaValue} 120%)`,
      };
    case 'luxury':
      return {
        background: `linear-gradient(135deg, ${color}${alphaValue}99 0%, transparent 35%, ${color}${alphaValue} 100%)`,
      };
    default:
      return {
        background: `${color}${alphaValue}`,
      };
  }
}