import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AdTemplateCardProps {
  title: string;
  dimensions: string;
  onClick: () => void;
  imageUrl?: string;
  description?: string;
}

export function AdTemplateCard({ title, dimensions, onClick, imageUrl, description }: AdTemplateCardProps) {
  return (
    <Card className="w-full hover:border-primary transition-colors cursor-pointer" onClick={onClick}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="w-full aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Preview</p>
              </div>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <p className="text-sm text-muted-foreground">{dimensions}</p>
          <Button className="w-full">Select Template</Button>
        </div>
      </CardContent>
    </Card>
  );
}
