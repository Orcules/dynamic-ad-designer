import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdPreviewProps {
  imageUrl?: string;
  width: number;
  height: number;
  headline?: string;
  ctaText?: string;
  templateStyle?: string;
  accentColor?: string;
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

export function AdPreview({ 
  imageUrl, 
  width, 
  height, 
  headline, 
  ctaText, 
  templateStyle,
  accentColor = "#4A90E2"
}: AdPreviewProps) {
  const getGradientByStyle = (style: string = 'minimal', color: string) => {
    const lighterColor = adjustColor(color, 20);
    const darkerColor = adjustColor(color, -20);
    const transparentColor = `${color}80`;

    switch (style) {
      case 'modern':
        return {
          background: `
            linear-gradient(135deg, ${darkerColor}dd 0%, ${color}bb 50%, ${lighterColor}dd 100%),
            radial-gradient(circle at top left, ${lighterColor}40, transparent 60%),
            radial-gradient(circle at bottom right, ${darkerColor}40, transparent 60%)
          `,
          backdropFilter: 'blur(8px)'
        };
      case 'bold':
        return {
          background: `
            linear-gradient(to right, ${darkerColor}ee, ${color}ee),
            radial-gradient(circle at top left, ${lighterColor}60, transparent 50%),
            radial-gradient(circle at bottom right, ${darkerColor}60, transparent 50%)
          `,
          backdropFilter: 'blur(12px)'
        };
      case 'elegant':
        return {
          background: `
            linear-gradient(45deg, ${darkerColor}cc 0%, ${color}bb 45%, ${lighterColor}cc 100%),
            linear-gradient(135deg, ${transparentColor} 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, ${lighterColor}40, transparent 50%)
          `,
          backdropFilter: 'blur(4px)'
        };
      default: // minimal
        return {
          background: `
            linear-gradient(to right, ${color}11, ${color}22),
            linear-gradient(45deg, ${transparentColor} 0%, transparent 100%)
          `,
          backdropFilter: 'blur(2px)'
        };
    }
  };

  const getTextStyle = (style: string = 'minimal') => {
    const baseStyle = {
      transition: 'all 0.4s ease',
      textShadow: 'none',
      fontWeight: 'normal' as const,
      letterSpacing: 'normal',
      fontSize: 'clamp(1.5rem, 4vw, 3rem)',
      lineHeight: '1.2',
      maxWidth: '90%',
      margin: '0 auto',
      padding: '0.5em',
    };

    switch (style) {
      case 'modern':
        return {
          ...baseStyle,
          textShadow: '2px 2px 4px rgba(0,0,0,0.3), -1px -1px 1px rgba(255,255,255,0.2)',
          fontWeight: 'bold' as const,
          letterSpacing: '0.05em',
          background: `linear-gradient(45deg, ${adjustColor(accentColor, 30)}, ${adjustColor(accentColor, -30)})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        };
      case 'bold':
        return {
          ...baseStyle,
          textShadow: '3px 3px 6px rgba(0,0,0,0.4), -1px -1px 2px rgba(255,255,255,0.2)',
          fontWeight: '800' as const,
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
        };
      case 'elegant':
        return {
          ...baseStyle,
          textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
          fontWeight: '500' as const,
          letterSpacing: '0.15em',
          fontStyle: 'italic',
        };
      default: // minimal
        return baseStyle;
    }
  };

  const getButtonStyle = (style: string = 'minimal') => {
    const baseStyle = {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'translateY(0)',
      padding: '0.8em 2em',
      fontSize: 'clamp(1rem, 2vw, 1.5rem)',
      fontWeight: '600',
      borderRadius: '9999px',
      cursor: 'pointer',
      position: 'relative' as const,
      overflow: 'hidden',
      isolation: 'isolate',
      boxShadow: 'none',
    };

    switch (style) {
      case 'modern':
        return {
          ...baseStyle,
          background: `linear-gradient(135deg, ${adjustColor(accentColor, 30)}, ${accentColor}, ${adjustColor(accentColor, -30)})`,
          boxShadow: `0 4px 15px ${adjustColor(accentColor, -30)}80`,
          border: '2px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(5px)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 6px 20px ${adjustColor(accentColor, -30)}90`,
          }
        };
      case 'bold':
        return {
          ...baseStyle,
          background: `linear-gradient(45deg, ${accentColor}, ${adjustColor(accentColor, 20)})`,
          boxShadow: `0 6px 20px ${adjustColor(accentColor, -30)}80`,
          border: 'none',
          '&:hover': {
            transform: 'translateY(-3px) scale(1.02)',
            boxShadow: `0 8px 25px ${adjustColor(accentColor, -30)}90`,
          }
        };
      case 'elegant':
        return {
          ...baseStyle,
          background: `linear-gradient(to right, ${adjustColor(accentColor, 20)}, ${accentColor})`,
          boxShadow: `0 2px 10px ${adjustColor(accentColor, -30)}40`,
          border: `2px solid ${adjustColor(accentColor, 30)}`,
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 15px ${adjustColor(accentColor, -30)}50`,
            background: `linear-gradient(to right, ${accentColor}, ${adjustColor(accentColor, 20)})`,
          }
        };
      default: // minimal
        return {
          ...baseStyle,
          background: accentColor,
          boxShadow: `0 2px 5px ${adjustColor(accentColor, -30)}40`,
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 10px ${adjustColor(accentColor, -30)}50`,
          }
        };
    }
  };

  const gradientStyle = getGradientByStyle(templateStyle, accentColor);
  const textStyle = getTextStyle(templateStyle);
  const buttonStyle = getButtonStyle(templateStyle);

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-right">תצוגה מקדימה</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="w-full relative rounded-lg overflow-hidden shadow-2xl transition-all duration-500"
          style={{
            aspectRatio: `${width}/${height}`,
          }}
        >
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Ad preview"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          )}
          <div
            className="absolute inset-0 transition-all duration-500"
            style={gradientStyle}
          />
          {headline && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <h2 
                className={cn(
                  "mb-6 transition-all duration-300 animate-fade-in",
                  templateStyle === 'minimal' ? 'text-black' : 'text-white'
                )}
                style={textStyle}
              >
                {headline}
              </h2>
              {ctaText && (
                <button 
                  className="transform hover:scale-105 transition-all duration-300"
                  style={buttonStyle}
                >
                  {ctaText}
                </button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}