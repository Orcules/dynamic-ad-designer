import { CSSProperties } from "react";

interface AdGradientProps {
  style?: string;
  color: string;
  opacity?: number;
}

export function AdGradient({ style = 'minimal', color, opacity = 0.4 }: AdGradientProps): CSSProperties {
  const alphaValue = Math.round(opacity * 255).toString(16).padStart(2, '0');
  const baseGradient = `${color}${alphaValue}`;

  switch (style) {
    case 'modern':
      return {
        background: `linear-gradient(to bottom, transparent 0%, ${baseGradient} 100%)`,
      };
    case 'elegant':
      return {
        background: `linear-gradient(180deg, transparent 0%, ${baseGradient} 100%)`,
      };
    case 'dynamic':
      return {
        background: `linear-gradient(45deg, ${baseGradient} 0%, transparent 100%)`,
      };
    case 'spotlight':
      return {
        background: `radial-gradient(circle at center, transparent 0%, ${baseGradient} 100%)`,
      };
    case 'wave':
      return {
        background: `linear-gradient(45deg, ${baseGradient} 0%, transparent 50%, ${baseGradient} 100%)`,
      };
    case 'cinematic':
      return {
        background: `linear-gradient(to bottom, ${baseGradient} 0%, transparent 50%, ${baseGradient} 100%)`,
      };
    case 'minimal-fade':
      return {
        background: `linear-gradient(to top, ${baseGradient} 0%, transparent 100%)`,
      };
    case 'duotone':
      return {
        background: `linear-gradient(135deg, ${baseGradient} 0%, transparent 100%)`,
      };
    case 'vignette':
      return {
        background: `radial-gradient(circle at center, transparent 0%, ${baseGradient} 120%)`,
      };
    case 'luxury':
      return {
        background: `linear-gradient(135deg, ${baseGradient} 0%, transparent 100%)`,
      };
    default:
      return {
        background: baseGradient,
      };
  }
}