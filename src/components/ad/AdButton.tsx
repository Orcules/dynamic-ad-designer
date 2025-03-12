
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
    fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5em',
    width: 'auto',
    minWidth: 'min(140px, 40%)',
    maxWidth: '80%',
    minHeight: '2.75em',
    lineHeight: '1.2',
    fontFamily: fontFamily || 'inherit',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    marginBottom: '1.5rem',
    zIndex: 10,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  switch (style) {
    case 'modern':
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${accentColor}, ${adjustColor(accentColor, 40)})`,
        borderRadius: '8px',
        transform: isHovered ? 'translateY(-3px)' : 'none',
        boxShadow: isHovered ? `0 8px 20px ${adjustColor(accentColor, -20)}40` : 'none',
        fontSize: 'clamp(1rem, 2vw, 1.25rem)',
        padding: '1.2em 3em',
      };

    case 'elegant':
      return {
        ...baseStyle,
        background: 'transparent',
        border: `2px solid ${accentColor}`,
        borderRadius: '50px',
        transform: isHovered ? 'scale(1.05)' : 'none',
        boxShadow: isHovered ? `0 0 15px ${accentColor}80` : 'none',
        fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
        padding: '0.6em 2em',
      };

    case 'dynamic':
      return {
        ...baseStyle,
        background: accentColor,
        clipPath: 'polygon(92% 0, 100% 25%, 100% 100%, 8% 100%, 0% 75%, 0 0)',
        transform: isHovered ? 'translateY(-2px) scale(1.02)' : 'none',
        padding: '1.5em 4em',
        fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)',
      };

    case 'spotlight':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '0',
        transform: isHovered ? 'perspective(500px) rotateX(10deg)' : 'none',
        boxShadow: isHovered ? `0 20px 30px ${adjustColor(accentColor, -30)}30` : 'none',
        fontSize: 'clamp(0.9rem, 1.8vw, 1.2rem)',
        padding: '1em 3.5em',
      };

    case 'wave':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '30px 4px',
        transform: isHovered ? 'translateY(-2px) rotate(-1deg)' : 'none',
        boxShadow: isHovered ? `5px 5px 0 ${adjustColor(accentColor, -20)}` : 'none',
        fontSize: 'clamp(0.8rem, 1.6vw, 1.1rem)',
        padding: '0.7em 2.5em',
      };

    case 'cinematic':
      return {
        ...baseStyle,
        background: `linear-gradient(45deg, ${adjustColor(accentColor, -20)}, ${accentColor})`,
        clipPath: 'polygon(95% 0, 100% 50%, 95% 100%, 5% 100%, 0 50%, 5% 0)',
        padding: '1.8em 5em',
        border: '1px solid rgba(255,255,255,0.2)',
        fontSize: 'clamp(1.2rem, 2.4vw, 1.5rem)',
      };

    case 'minimal-fade':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        opacity: isHovered ? '1' : '0.9',
        transform: isHovered ? 'translateY(-1px)' : 'none',
        fontSize: 'clamp(0.7rem, 1.4vw, 0.9rem)',
        padding: '0.5em 1.5em',
      };

    case 'duotone':
      return {
        ...baseStyle,
        background: `linear-gradient(45deg, ${accentColor}, ${adjustColor(accentColor, 30)})`,
        borderRadius: '0 15px 0 15px',
        transform: isHovered ? 'scale(1.05)' : 'none',
        border: '2px solid rgba(255,255,255,0.2)',
        fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)',
        padding: '1.3em 4em',
      };

    case 'vignette':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '20px 0',
        transform: isHovered ? 'rotate(-2deg)' : 'none',
        boxShadow: isHovered ? `0 10px 20px ${adjustColor(accentColor, -20)}50` : 'none',
        fontSize: 'clamp(0.85rem, 1.7vw, 1.15rem)',
        padding: '0.9em 3em',
      };

    case 'luxury':
      return {
        ...baseStyle,
        background: 'transparent',
        border: `1px solid ${accentColor}`,
        borderRadius: '0',
        padding: '2em 6em',
        boxShadow: isHovered ? `inset 0 0 20px ${accentColor}50` : 'none',
        fontSize: 'clamp(1.3rem, 2.6vw, 1.6rem)',
      };

    case 'retro':
      return {
        ...baseStyle,
        background: accentColor,
        border: '3px solid #fff',
        transform: isHovered ? 'translate(-4px, -4px)' : 'none',
        boxShadow: isHovered ? `4px 4px 0 #fff` : '2px 2px 0 #fff',
        fontSize: 'clamp(0.95rem, 1.9vw, 1.25rem)',
        padding: '1.1em 3.2em',
      };

    case 'glassmorphism':
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${adjustColor(accentColor, 40)}40, ${accentColor}40)`,
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '16px',
        boxShadow: isHovered ? `0 8px 32px ${accentColor}30` : 'none',
        fontSize: 'clamp(0.8rem, 1.6vw, 1.1rem)',
        padding: '0.8em 2.8em',
      };

    case '3d':
      return {
        ...baseStyle,
        background: accentColor,
        transform: isHovered ? 'translateZ(20px)' : 'translateZ(10px)',
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        boxShadow: isHovered ? `0 20px 40px ${adjustColor(accentColor, -30)}50` : 'none',
        fontSize: 'clamp(1.15rem, 2.3vw, 1.45rem)',
        padding: '1.4em 4.2em',
      };

    case 'vintage':
      return {
        ...baseStyle,
        background: accentColor,
        border: '2px solid #fff',
        borderRadius: '0',
        transform: isHovered ? 'rotate(2deg)' : 'none',
        boxShadow: isHovered ? `8px 8px 0 rgba(0,0,0,0.2)` : '4px 4px 0 rgba(0,0,0,0.2)',
        fontSize: 'clamp(0.75rem, 1.5vw, 1rem)',
        padding: '0.7em 2.4em',
      };

    case 'tech':
      return {
        ...baseStyle,
        background: 'transparent',
        border: `2px solid ${accentColor}`,
        borderRadius: '4px',
        boxShadow: isHovered 
          ? `0 0 20px ${accentColor}, inset 0 0 20px ${accentColor}` 
          : `0 0 10px ${accentColor}`,
        fontSize: 'clamp(1.05rem, 2.1vw, 1.35rem)',
        padding: '1.2em 3.8em',
      };

    case 'nature':
      return {
        ...baseStyle,
        background: `linear-gradient(to right, ${adjustColor(accentColor, -20)}, ${accentColor})`,
        borderRadius: '50px',
        transform: isHovered ? 'translateY(-3px)' : 'none',
        boxShadow: isHovered ? `0 10px 20px ${adjustColor(accentColor, -20)}40` : 'none',
        fontSize: 'clamp(0.9rem, 1.8vw, 1.2rem)',
        padding: '1em 3em',
      };

    case 'urban':
      return {
        ...baseStyle,
        background: accentColor,
        clipPath: isHovered 
          ? 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)' 
          : 'polygon(4% 0, 96% 0, 96% 100%, 4% 100%)',
        fontSize: 'clamp(1.25rem, 2.5vw, 1.55rem)',
        padding: '1.6em 4.5em',
      };

    case 'artistic':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '0',
        transform: isHovered 
          ? 'rotate(-3deg) scale(1.1)' 
          : 'rotate(-3deg)',
        border: '2px solid #fff',
        fontSize: 'clamp(0.85rem, 1.7vw, 1.15rem)',
        padding: '0.9em 2.9em',
      };

    // New styles based on examples
    case 'banner-top':
    case 'banner-bottom':
      return {
        ...baseStyle,
        background: '#1EAEDB',
        color: '#FFFFFF',
        borderRadius: '4px',
        fontWeight: 'bold',
        boxShadow: isHovered ? '0 4px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        padding: '0.7em 2em',
        fontSize: 'clamp(0.9rem, 1.3vw, 1.1rem)',
        textTransform: 'none',
      };

    case 'framed':
      return {
        ...baseStyle,
        backgroundColor: accentColor,
        border: '3px solid #FFFFFF',
        borderRadius: '8px',
        boxShadow: isHovered ? '0 0 20px rgba(0,0,0,0.4)' : '0 0 10px rgba(0,0,0,0.2)',
        transform: isHovered ? 'scale(1.05)' : 'none',
      };

    case 'corner-accent':
      return {
        ...baseStyle,
        background: '#FFFFFF',
        color: '#000000',
        borderRadius: '0',
        border: `2px solid ${accentColor}`,
        fontWeight: 'bold',
        boxShadow: isHovered ? '4px 4px 0 rgba(0,0,0,0.8)' : '2px 2px 0 rgba(0,0,0,0.5)',
        transform: isHovered ? 'translate(-2px, -2px)' : 'none',
      };

    case 'tech-glow':
      return {
        ...baseStyle,
        background: 'rgba(30,174,219,0.9)',
        border: '1px solid #33F3FF',
        borderRadius: '50px',
        boxShadow: isHovered 
          ? '0 0 20px #33F3FF, inset 0 0 10px #33F3FF' 
          : '0 0 10px #33F3FF',
        transform: isHovered ? 'scale(1.05)' : 'none',
        padding: '0.7em 2.5em',
      };

    case 'luxury-frame':
      return {
        ...baseStyle,
        background: 'rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,215,0,0.8)',
        color: '#FFD700',
        boxShadow: isHovered 
          ? '0 0 15px rgba(255,215,0,0.5), inset 0 0 5px rgba(255,215,0,0.5)' 
          : '0 0 5px rgba(255,215,0,0.3)',
        borderRadius: '0',
        letterSpacing: '0.1em',
        transform: isHovered ? 'translateY(-2px)' : 'none',
      };

    case 'overlay-bottom-clean':
    case 'overlay-bottom-gradient':
    case 'overlay-bottom-glass':
    case 'overlay-bottom-neon':
    case 'overlay-bottom-minimal':
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.2)',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        fontSize: 'clamp(0.8rem, 1.4vw, 1rem)',
        margin: '0 0 1.5rem 1.5rem',
        padding: '0.7em 2em',
        alignSelf: 'flex-start',
      };

    case 'overlay-full':
      return {
        ...baseStyle,
        background: 'rgba(255,255,255,0.9)',
        color: '#000000',
        borderRadius: '4px',
        boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.2)',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        fontWeight: 'bold',
      };
    
    default:
      return {
        ...baseStyle,
        background: accentColor,
        borderRadius: '4px',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        boxShadow: isHovered ? '0 4px 8px rgba(0,0,0,0.15)' : 'none',
        fontSize: 'clamp(0.8rem, 1.6vw, 1.1rem)',
        padding: '0.8em 2.6em',
      };
  }
}

function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;
  
  r = Math.min(Math.max(0, r), 255);
  g = Math.min(Math.max(0, g), 255);
  b = Math.min(Math.max(0, b), 255);
  
  return `#${(g | (r << 8) | (b << 16)).toString(16).padStart(6, '0')}`;
}
