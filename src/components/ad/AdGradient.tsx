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
        background: `linear-gradient(135deg, ${baseGradient} 0%, rgba(0,0,0,0.8) 50%, ${baseGradient} 100%)`,
        mixBlendMode: 'multiply',
      };
    case 'elegant':
      return {
        background: `linear-gradient(180deg, ${baseGradient} 0%, rgba(0,0,0,0.7) 35%, ${baseGradient} 100%)`,
        mixBlendMode: 'overlay',
      };
    case 'dynamic':
      return {
        background: `linear-gradient(45deg, ${baseGradient} 0%, rgba(0,0,0,0.8) 30%, ${baseGradient} 70%, rgba(0,0,0,0.8) 100%)`,
        mixBlendMode: 'hard-light',
      };
    case 'spotlight':
      return {
        background: `radial-gradient(circle at 30% 30%, transparent 0%, rgba(0,0,0,0.8) 60%, ${baseGradient} 100%)`,
        mixBlendMode: 'multiply',
      };
    case 'wave':
      return {
        background: `linear-gradient(45deg, ${baseGradient} 0%, rgba(0,0,0,0.8) 25%, ${baseGradient} 50%, rgba(0,0,0,0.8) 75%, ${baseGradient} 100%)`,
        mixBlendMode: 'soft-light',
      };
    case 'cinematic':
      return {
        background: `linear-gradient(to bottom, ${baseGradient} 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.8) 60%, ${baseGradient} 100%)`,
        mixBlendMode: 'overlay',
      };
    case 'minimal-fade':
      return {
        background: `linear-gradient(to top, ${baseGradient} 0%, rgba(0,0,0,0.8) 100%)`,
      };
    case 'duotone':
      return {
        background: `linear-gradient(135deg, ${baseGradient} 0%, rgba(0,0,0,0.8) 50%, ${baseGradient} 100%)`,
        mixBlendMode: 'color',
      };
    case 'vignette':
      return {
        background: `radial-gradient(circle at 50% 50%, transparent 10%, rgba(0,0,0,0.8) 70%, ${baseGradient} 120%)`,
        mixBlendMode: 'multiply',
      };
    case 'luxury':
      return {
        background: `linear-gradient(135deg, ${baseGradient} 0%, rgba(0,0,0,0.8) 35%, ${baseGradient} 100%)`,
        mixBlendMode: 'overlay',
      };
    default:
      return {
        background: `${color}${alphaValue}`,
      };
  }
}