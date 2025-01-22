import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdPreviewProps {
  imageUrl?: string;
  width: number;
  height: number;
  headline?: string;
  ctaText?: string;
  templateStyle?: string;
}

export function AdPreview({ imageUrl, width, height, headline, ctaText, templateStyle }: AdPreviewProps) {
  const getGradientByStyle = (style: string = 'minimal') => {
    switch (style) {
      case 'modern':
        return 'linear-gradient(180deg, rgb(254,100,121) 0%, rgb(251,221,186) 100%)';
      case 'bold':
        return 'linear-gradient(102.3deg, rgba(147,39,143,1) 5.9%, rgba(234,172,232,1) 64%, rgba(246,219,245,1) 89%)';
      case 'elegant':
        return 'linear-gradient(225deg, #FFE29F 0%, #FFA99F 48%, #FF719A 100%)';
      default:
        return 'linear-gradient(109.6deg, rgba(223,234,247,1) 11.2%, rgba(244,248,252,1) 91.1%)';
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-right">תצוגה מקדימה</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="w-full relative rounded-lg overflow-hidden"
          style={{
            aspectRatio: `${width}/${height}`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: getGradientByStyle(templateStyle),
              opacity: imageUrl ? 0.7 : 1,
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
              <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
                {headline}
              </h2>
              {ctaText && (
                <button className="px-6 py-2 bg-white text-black rounded-full font-semibold transform hover:scale-105 transition-transform">
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