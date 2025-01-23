import { CSSProperties } from "react";

interface AdButtonProps {
  style?: string;
  accentColor: string;
  isHovered: boolean;
  fontFamily: string;
}

export function getButtonStyle({ style = 'minimal', accentColor, isHovered, fontFamily }: AdButtonProps): CSSProperties {
  const baseStyle: CSSProperties = {
    padding: '0.8em 2em',
    fontSize: 'clamp(0.75rem, 1.5vw, 1.1rem)',
    fontWeight: '600',
    borderRadius: '9999px',
    cursor: 'pointer',
    position: 'relative',
    maxWidth: '90%',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'auto',
    minWidth: 'min(200px, 50%)',
    minHeight: '2.5em',
    lineHeight: '1.2',
    fontFamily: fontFamily || 'inherit',
    textAlign: 'center',
    color: '#FFFFFF',
    border: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };

  switch (style) {
    case 'modern':
      return {
        ...baseStyle,
        background: accentColor,
      };
    case 'bold':
      return {
        ...baseStyle,
        background: accentColor,
        fontWeight: '700',
      };
    case 'elegant':
      return {
        ...baseStyle,
        background: accentColor,
        letterSpacing: '0.05em',
      };
    default: // minimal
      return {
        ...baseStyle,
        background: accentColor,
      };
  }
}