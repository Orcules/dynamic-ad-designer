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

    const lighterColor = adjustColor(color, 20);
    const darkerColor = adjustColor(color, -20);

    switch (style) {
      case 'modern':
        return `linear-gradient(180deg, ${color} 0%, ${lighterColor} 100%)`;
      case 'bold':
        return `linear-gradient(102.3deg, ${darkerColor} 5.9%, ${color} 64%, ${lighterColor} 89%)`;
      case 'elegant':
        return `linear-gradient(225deg, ${lighterColor} 0%, ${color} 48%, ${darkerColor} 100%)`;
      default: // minimal
        return `linear-gradient(109.6deg, ${color}22 11.2%, ${color}44 91.1%)`;
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-right">תצוגה מקדימה</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="w-full relative rounded-lg overflow-hidden shadow-xl"
          style={{
            aspectRatio: `${width}/${height}`,
          }}
        >
          <div
            className="absolute inset-0 transition-all duration-500"
            style={{
              background: getGradientByStyle(templateStyle, accentColor),
              opacity: imageUrl ? 0.85 : 1,
            }}
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Ad preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {headline && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <h2 
                className="text-3xl font-bold mb-4 transition-all duration-300"
                style={{
                  color: templateStyle === 'minimal' ? '#000000' : '#ffffff',
                  textShadow: templateStyle === 'minimal' 
                    ? 'none' 
                    : '2px 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                {headline}
              </h2>
              {ctaText && (
                <button 
                  className="px-6 py-2 rounded-full font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg"
                  style={{
                    backgroundColor: templateStyle === 'minimal' ? accentColor : '#ffffff',
                    color: templateStyle === 'minimal' ? '#ffffff' : '#000000',
                  }}
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