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
        background: `linear-gradient(180deg, rgb(254,100,121) 0%, rgb(251,221,186) 100%)`,
        opacity: opacity,
      };
    case 'elegant':
      return {
        background: `linear-gradient(to right, #243949 0%, #517fa4 100%)`,
        opacity: opacity,
      };
    case 'dynamic':
      return {
        background: `linear-gradient(102.3deg, rgba(147,39,143,1) 5.9%, rgba(234,172,232,1) 64%, rgba(246,219,245,1) 89%)`,
        opacity: opacity,
      };
    case 'spotlight':
      return {
        background: `radial-gradient(circle at center, transparent 0%, ${baseGradient} 120%)`,
        backdropFilter: 'blur(8px)',
      };
    case 'wave':
      return {
        background: `linear-gradient(90deg, hsla(24, 100%, 83%, 1) 0%, hsla(341, 91%, 68%, 1) 100%)`,
        opacity: opacity,
      };
    case 'cinematic':
      return {
        background: `linear-gradient(225deg, #FFE29F 0%, #FFA99F 48%, #FF719A 100%)`,
        opacity: opacity,
      };
    case 'minimal-fade':
      return {
        background: `linear-gradient(90deg, hsla(186, 33%, 94%, 1) 0%, hsla(216, 41%, 79%, 1) 100%)`,
        opacity: opacity,
      };
    case 'duotone':
      return {
        background: `linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)`,
        opacity: opacity,
      };
    case 'vignette':
      return {
        background: `radial-gradient(circle at center, transparent 0%, ${baseGradient} 120%)`,
        backdropFilter: 'blur(12px)',
      };
    case 'luxury':
      return {
        background: `linear-gradient(to right, #ffc3a0 0%, #ffafbd 100%)`,
        opacity: opacity,
      };
    default:
      return {
        background: baseGradient,
      };
  }
}