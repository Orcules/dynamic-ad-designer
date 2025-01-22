import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";

interface AdTemplateCardProps {
  title: string;
  dimensions: string;
  onClick: () => void;
}

export function AdTemplateCard({ title, dimensions, onClick }: AdTemplateCardProps) {
  return (
    <Card className="w-[300px] hover:border-primary transition-colors cursor-pointer" onClick={onClick}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="w-full h-[160px] bg-muted rounded-md flex items-center justify-center">
            <Image className="w-12 h-12 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{dimensions}</p>
          <Button className="w-full">Select Template</Button>
        </div>
      </CardContent>
    </Card>
  );
}