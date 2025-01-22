import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Upload } from "lucide-react";

interface AdEditorProps {
  template: {
    title: string;
    dimensions: string;
  };
}

export function AdEditor({ template }: AdEditorProps) {
  const [headline, setHeadline] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const { toast } = useToast();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please drop an image file",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{template.title}</h2>
        <p className="text-muted-foreground">{template.dimensions}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="headline">Headline</Label>
          <Input
            id="headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Enter your headline"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cta">CTA Text</Label>
          <Input
            id="cta"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            placeholder="Enter CTA text"
          />
        </div>

        <div
          className="border-2 border-dashed rounded-lg p-8 text-center space-y-4 cursor-pointer hover:border-primary transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">
              Drag and drop your image here, or click to select
            </p>
            {image && <p className="text-sm text-primary mt-2">{image.name}</p>}
          </div>
        </div>

        <Button className="w-full">Generate Ads</Button>
      </div>
    </div>
  );
}