import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    const transparentColor = `${color}80`; // 50% transparency

    switch (style) {
      case 'modern':
        return `linear-gradient(135deg, ${darkerColor} 0%, ${color} 50%, ${lighterColor} 100%)`;
      case 'bold':
        return `linear-gradient(to right, ${darkerColor}ee, ${color}ee), 
                radial-gradient(circle at top left, ${lighterColor}60, transparent 50%),
                radial-gradient(circle at bottom right, ${darkerColor}60, transparent 50%)`;
      case 'elegant':
        return `linear-gradient(45deg, ${darkerColor}ee 0%, ${color}dd 45%, ${lighterColor}ee 100%),
                linear-gradient(135deg, ${transparentColor} 0%, transparent 50%)`;
      default: // minimal
        return `linear-gradient(to right, ${color}11, ${color}33),
                linear-gradient(45deg, ${transparentColor} 0%, transparent 100%)`;
    }
  };

  const getTextStyle = (style: string = 'minimal') => {
    switch (style) {
      case 'modern':
        return {
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          fontWeight: 'bold',
          letterSpacing: '1px'
        };
      case 'bold':
        return {
          textShadow: '3px 3px 6px rgba(0,0,0,0.4), -1px -1px 2px rgba(255,255,255,0.2)',
          fontWeight: 'extrabold',
          letterSpacing: '2px'
        };
      case 'elegant':
        return {
          textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
          fontWeight: 'medium',
          letterSpacing: '3px'
        };
      default: // minimal
        return {
          textShadow: 'none',
          fontWeight: 'normal',
          letterSpacing: 'normal'
        };
    }
  };

  const getButtonStyle = (style: string = 'minimal') => {
    const baseStyle = {
      transition: 'all 0.3s ease',
      transform: 'scale(1)',
    };

    switch (style) {
      case 'modern':
        return {
          ...baseStyle,
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          border: '2px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(5px)',
          background: 'rgba(255,255,255,0.9)',
        };
      case 'bold':
        return {
          ...baseStyle,
          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
          border: 'none',
          background: `linear-gradient(45deg, ${accentColor}, ${adjustColor(accentColor, 20)})`,
        };
      case 'elegant':
        return {
          ...baseStyle,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: `2px solid ${accentColor}`,
          background: 'rgba(255,255,255,0.95)',
        };
      default: // minimal
        return {
          ...baseStyle,
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          border: 'none',
          background: accentColor,
        };
    }
  };

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
            style={{
              background: getGradientByStyle(templateStyle, accentColor),
              opacity: imageUrl ? 0.85 : 1,
            }}
          />
          {headline && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <h2 
                className="text-4xl mb-6 transition-all duration-300 animate-fade-in"
                style={{
                  color: templateStyle === 'minimal' ? '#000000' : '#ffffff',
                  ...getTextStyle(templateStyle),
                }}
              >
                {headline}
              </h2>
              {ctaText && (
                <button 
                  className="px-8 py-3 rounded-full font-semibold transform hover:scale-105 transition-all duration-300"
                  style={getButtonStyle(templateStyle)}
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