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
        background: `linear-gradient(135deg, ${color}${alphaValue} 0%, ${color}${alphaValue} 100%)`,
        backdropFilter: 'blur(8px)',
      };
    case 'elegant':
      return {
        background: `linear-gradient(to bottom, transparent 0%, ${color}${alphaValue} 100%)`,
        backdropFilter: 'blur(6px)',
      };
    case 'dynamic':
      return {
        background: `linear-gradient(135deg, ${color}${alphaValue} 0%, transparent 50%, ${color}${alphaValue} 100%)`,
        backdropFilter: 'blur(4px)',
      };
    case 'minimal-fade':
      return {
        background: `linear-gradient(to top, ${color}${alphaValue} 0%, transparent 100%)`,
        backdropFilter: 'blur(3px)',
      };
    default:
      return {
        background: `rgba(0,0,0,${opacity})`,
        backdropFilter: 'blur(8px)',
      };
  }
}