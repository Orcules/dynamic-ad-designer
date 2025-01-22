import { CSSProperties } from "react";

interface AdGradientProps {
  style?: string;
  color: string;
}

const adjustColor = (hex: string, percent: number) => {
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
};

export function AdGradient({ style = 'minimal', color }: AdGradientProps): CSSProperties {
  const lighterColor = adjustColor(color, 20);
  const darkerColor = adjustColor(color, -20);
  const transparentColor = `${color}80`;

  switch (style) {
    case 'modern':
      return {
        background: `
          linear-gradient(135deg, ${darkerColor}aa 0%, ${color}88 50%, ${lighterColor}aa 100%),
          radial-gradient(circle at top left, ${lighterColor}20, transparent 60%),
          radial-gradient(circle at bottom right, ${darkerColor}20, transparent 60%)
        `,
        backdropFilter: 'blur(8px)'
      };
    case 'bold':
      return {
        background: `
          linear-gradient(to right, ${darkerColor}cc, ${color}cc),
          radial-gradient(circle at top left, ${lighterColor}40, transparent 50%),
          radial-gradient(circle at bottom right, ${darkerColor}40, transparent 50%)
        `,
        backdropFilter: 'blur(12px)'
      };
    case 'elegant':
      return {
        background: `
          linear-gradient(45deg, ${darkerColor}99 0%, ${color}88 45%, ${lighterColor}99 100%),
          linear-gradient(135deg, ${transparentColor} 0%, transparent 50%),
          radial-gradient(circle at 70% 30%, ${lighterColor}20, transparent 50%)
        `,
        backdropFilter: 'blur(4px)'
      };
    default: // minimal
      return {
        background: `
          linear-gradient(to right, ${color}08, ${color}11),
          linear-gradient(45deg, ${transparentColor} 0%, transparent 100%)
        `,
        backdropFilter: 'blur(2px)'
      };
  }
}