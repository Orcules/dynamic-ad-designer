
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
        background: `linear-gradient(180deg, transparent 0%, ${baseGradient} 100%)`,
      };
    case 'elegant':
      return {
        background: `linear-gradient(180deg, ${baseGradient} 0%, transparent 50%, ${baseGradient} 100%)`,
      };
    case 'dynamic':
      return {
        background: `linear-gradient(135deg, ${baseGradient} 0%, transparent 100%)`,
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
        background: `linear-gradient(135deg, ${baseGradient} 0%, transparent 50%, ${baseGradient} 100%)`,
      };
    case 'vignette':
      return {
        background: `radial-gradient(circle at center, transparent 0%, ${baseGradient} 120%)`,
      };
    case 'luxury':
      return {
        background: `linear-gradient(135deg, ${baseGradient} 0%, transparent 50%, ${baseGradient} 100%)`,
      };
    // New styles based on examples
    case 'banner-top':
      return {
        background: `linear-gradient(to bottom, ${color} 0%, ${color} 15%, transparent 15.1%, transparent 100%)`,
      };
    case 'banner-bottom':
      return {
        background: `linear-gradient(to top, ${color} 0%, ${color} 15%, transparent 15.1%, transparent 100%)`,
      };
    case 'framed':
      return {
        background: `linear-gradient(to right, ${color} 3%, transparent 3.1%, transparent 96.9%, ${color} 97%),
                     linear-gradient(to bottom, ${color} 3%, transparent 3.1%, transparent 96.9%, ${color} 97%)`,
      };
    case 'corner-accent':
      return {
        background: `linear-gradient(135deg, ${color} 0%, ${color} 10%, transparent 10.1%, transparent 100%)`,
      };
    case 'tech-glow':
      return {
        background: `radial-gradient(circle at 30% 40%, rgba(0,255,200,0.4) 0%, transparent 60%)`,
        boxShadow: 'inset 0 0 100px rgba(0,255,200,0.2)',
      };
    case 'luxury-frame':
      return {
        background: 'transparent',
        boxShadow: `inset 0 0 0 10px rgba(255,215,0,0.3), inset 0 0 0 1px ${color}`,
      };
    case 'overlay-full':
      return {
        background: `${baseGradient}`,
      };
    case 'overlay-bottom-clean':
      return {
        background: `linear-gradient(to top, ${color} 0%, ${color} 30%, transparent 70%)`,
      };
    case 'overlay-bottom-gradient':
      return {
        background: `linear-gradient(to top, ${color} 0%, transparent 70%)`,
      };
    case 'overlay-bottom-glass':
      return {
        background: `linear-gradient(to top, ${color}BB 0%, ${color}88 30%, transparent 70%)`,
        backdropFilter: 'blur(4px)',
      };
    case 'overlay-bottom-neon':
      return {
        background: `linear-gradient(to top, ${color}BB 0%, transparent 70%)`,
        boxShadow: `inset 0 -50px 50px -10px rgba(255,255,255,0.2)`,
      };
    case 'overlay-bottom-minimal':
      return {
        background: `linear-gradient(to top, ${color}DD 0%, ${color}AA 10%, transparent 50%)`,
      };
    default:
      return {
        background: baseGradient,
      };
  }
}
