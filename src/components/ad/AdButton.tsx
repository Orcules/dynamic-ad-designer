import { CSSProperties } from "react";

interface AdButtonProps {
  style?: string;
  accentColor: string;
  isHovered: boolean;
  fontFamily: string;
}

export function getButtonStyle({ style = 'minimal', accentColor, isHovered, fontFamily }: AdButtonProps): CSSProperties {
  const baseStyle: CSSProperties = {
    padding: '1em 2.5em',
    fontSize: 'clamp(0.875rem, 2vw, 1.25rem)',
    fontWeight: '600',
    cursor: 'pointer',
    transform: isHovered ? 'translateY(-2px)' : 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5em',
    width: 'auto',
    minWidth: 'min(160px, 40%)',
    maxWidth: '80%',
    minHeight: '3em',
    lineHeight: '1.2',
    fontFamily: fontFamily || 'inherit',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    marginBottom: '1.5rem',
    zIndex: 10,
    color: '#FFFFFF',
  };

  switch (style) {
    case 'modern':
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
        borderRadius: '8px',
        boxShadow: isHovered 
          ? `0 15px 25px rgba(0,0,0,0.2), 0 0 15px ${accentColor}66` 
          : `0 8px 15px rgba(0,0,0,0.1), 0 0 10px ${accentColor}33`,
        border: '1px solid rgba(255,255,255,0.1)',
        clipPath: 'polygon(5% 0, 95% 0, 100% 100%, 0% 100%)',
      };
    case 'elegant':
      return {
        ...baseStyle,
        background: 'transparent',
        border: `2px solid ${accentColor}`,
        borderRadius: '50px',
        boxShadow: isHovered 
          ? `0 10px 20px rgba(0,0,0,0.2), 0 0 20px ${accentColor}33` 
          : `0 5px 10px rgba(0,0,0,0.1), 0 0 10px ${accentColor}22`,
        transform: isHovered ? 'translateY(-2px) scale(1.02)' : 'none',
      };
    case 'dynamic':
      return {
        ...baseStyle,
        background: `linear-gradient(45deg, ${accentColor}, ${accentColor}dd)`,
        transform: isHovered ? 'translateY(-2px) skew(-10deg)' : 'skew(-10deg)',
        boxShadow: isHovered 
          ? `0 15px 30px rgba(0,0,0,0.2), 0 0 20px ${accentColor}44` 
          : `0 8px 15px rgba(0,0,0,0.1), 0 0 10px ${accentColor}33`,
        border: '1px solid rgba(255,255,255,0.15)',
        clipPath: 'polygon(0 10%, 100% 0, 100% 90%, 0% 100%)',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        background: `radial-gradient(circle at center, ${accentColor}, ${accentColor}dd)`,
        borderRadius: '12px',
        boxShadow: isHovered 
          ? `0 0 30px ${accentColor}66, 0 15px 30px rgba(0,0,0,0.2)` 
          : `0 0 20px ${accentColor}44, 0 8px 15px rgba(0,0,0,0.1)`,
        border: '1px solid rgba(255,255,255,0.2)',
        transform: isHovered ? 'translateY(-2px) scale(1.05)' : 'none',
      };
    case 'wave':
      return {
        ...baseStyle,
        background: `linear-gradient(-45deg, ${accentColor}, ${accentColor}dd)`,
        borderRadius: '8px',
        transform: isHovered ? 'translateY(-2px) rotate(-2deg)' : 'rotate(-2deg)',
        boxShadow: isHovered 
          ? `0 15px 30px rgba(0,0,0,0.2), 0 0 20px ${accentColor}44` 
          : `0 8px 15px rgba(0,0,0,0.1), 0 0 10px ${accentColor}33`,
        border: '2px solid rgba(255,255,255,0.1)',
        clipPath: 'polygon(0 15%, 100% 0, 100% 85%, 0% 100%)',
      };
    case 'cinematic':
      return {
        ...baseStyle,
        background: `linear-gradient(to right, ${accentColor}, ${accentColor}dd)`,
        border: '2px solid rgba(255,255,255,0.2)',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        boxShadow: isHovered 
          ? `0 20px 40px rgba(0,0,0,0.3), 0 0 20px ${accentColor}44` 
          : `0 10px 20px rgba(0,0,0,0.2), 0 0 10px ${accentColor}33`,
        transform: isHovered ? 'translateY(-2px) scale(1.03)' : 'none',
      };
    case 'minimal-fade':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '6px',
        opacity: isHovered ? '1' : '0.9',
        boxShadow: isHovered 
          ? `0 12px 24px rgba(0,0,0,0.2), 0 0 15px ${accentColor}44` 
          : `0 6px 12px rgba(0,0,0,0.1), 0 0 10px ${accentColor}33`,
        border: '1px solid rgba(255,255,255,0.1)',
        clipPath: 'polygon(5% 0, 95% 0, 100% 100%, 0% 100%)',
      };
    case 'duotone':
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
        borderRadius: '10px',
        border: '2px solid rgba(255,255,255,0.15)',
        boxShadow: isHovered 
          ? `0 15px 30px rgba(0,0,0,0.2), 0 0 20px ${accentColor}44` 
          : `0 8px 15px rgba(0,0,0,0.1), 0 0 10px ${accentColor}33`,
        transform: isHovered ? 'translateY(-2px) scale(1.04)' : 'none',
      };
    case 'vignette':
      return {
        ...baseStyle,
        background: `radial-gradient(circle at center, ${accentColor}, ${accentColor}dd)`,
        borderRadius: '8px',
        boxShadow: isHovered 
          ? `0 15px 30px rgba(0,0,0,0.3), 0 0 25px ${accentColor}44` 
          : `0 8px 15px rgba(0,0,0,0.2), 0 0 15px ${accentColor}33`,
        border: '1px solid rgba(255,255,255,0.15)',
        transform: isHovered ? 'translateY(-2px) scale(1.02)' : 'none',
      };
    case 'luxury':
      return {
        ...baseStyle,
        background: 'transparent',
        border: `1px solid ${accentColor}`,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        boxShadow: isHovered 
          ? `0 12px 24px rgba(0,0,0,0.2), 0 0 20px ${accentColor}44` 
          : `0 6px 12px rgba(0,0,0,0.1), 0 0 10px ${accentColor}33`,
        transform: isHovered ? 'translateY(-2px) scale(1.03)' : 'none',
      };
    default:
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '6px',
        boxShadow: isHovered 
          ? `0 8px 16px rgba(0,0,0,0.2), 0 0 15px ${accentColor}44` 
          : `0 4px 8px rgba(0,0,0,0.1), 0 0 10px ${accentColor}33`,
        border: '1px solid rgba(255,255,255,0.1)',
      };
  }
}