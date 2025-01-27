import { CSSProperties } from "react";
import { ArrowBigDown } from "lucide-react";

interface AdTextProps {
  style?: string;
  accentColor: string;
  fontFamily: string;
}

export function getTextStyle({ style = 'minimal', accentColor, fontFamily }: AdTextProps): CSSProperties {
  const baseStyle: CSSProperties = {
    fontWeight: 'bold',
    fontSize: 'clamp(1rem, 4vw, 2.5rem)',
    lineHeight: '1.2',
    maxWidth: '90%',
    margin: '0 auto',
    padding: '1rem',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    fontFamily: fontFamily || 'inherit',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxHeight: '45%',
  };

  switch (style) {
    case 'dynamic':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        position: 'absolute',
        top: '15%',
        left: '10%',
        transform: 'skew(-5deg)',
        textAlign: 'left',
        background: `linear-gradient(135deg, ${accentColor}ee, ${accentColor}99)`,
        borderRadius: '0 16px 16px 0',
        padding: '1.5rem 2.5rem',
        maxWidth: '75%',
        boxShadow: '4px 4px 15px rgba(0,0,0,0.2)',
      };
    case 'spotlight':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        background: `${accentColor}dd`,
        borderRadius: '20px',
        padding: '1.5rem',
        maxWidth: '80%',
        backdropFilter: 'blur(8px)',
      };
    case 'wave':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        background: `${accentColor}cc`,
        borderRadius: '30px',
        padding: '1.5rem 2rem',
        maxWidth: '85%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      };
    case 'geometric':
      return {
        ...baseStyle,
        color: '#FFFFFF',
        position: 'absolute',
        top: '15%',
        left: '8%',
        textAlign: 'left',
        background: `${accentColor}dd`,
        clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)',
        padding: '1.5rem 3rem 1.5rem 2rem',
        maxWidth: '70%',
      };
    default:
      return {
        ...baseStyle,
        color: '#000000',
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '12px',
        padding: '1.5rem',
        maxWidth: '75%',
      };
  }
}