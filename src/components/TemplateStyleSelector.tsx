import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface TemplateStyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  accentColor: string;
  onColorChange: (value: string) => void;
  overlayOpacity?: number;
  onOpacityChange?: (value: number) => void;
  ctaColor: string;
  onCtaColorChange: (value: string) => void;
  overlayColor: string;
  onOverlayColorChange: (value: string) => void;
  textColor: string;
  onTextColorChange: (value: string) => void;
  descriptionColor: string;
  onDescriptionColorChange: (value: string) => void;
}

export function TemplateStyleSelector({ 
  value, 
  onChange,
  accentColor,
  onColorChange,
  overlayOpacity = 0.4,
  onOpacityChange,
  ctaColor,
  onCtaColorChange,
  overlayColor,
  onOverlayColorChange,
  textColor,
  onTextColorChange,
  descriptionColor,
  onDescriptionColorChange,
}: TemplateStyleSelectorProps) {
  const templates = [
    { id: "modern", label: "Modern" },
    { id: "elegant", label: "Elegant" },
    { id: "dynamic", label: "Dynamic" },
    { id: "spotlight", label: "Spotlight" },
    { id: "wave", label: "Wave" },
    { id: "cinematic", label: "Cinematic" },
    { id: "minimal-fade", label: "Minimal Fade" },
    { id: "duotone", label: "Duotone" },
    { id: "vignette", label: "Vignette" },
    { id: "luxury", label: "Luxury" },
    { id: "overlay-bottom-clean", label: "Bottom Clean" },
    { id: "overlay-bottom-gradient", label: "Bottom Gradient" },
    { id: "overlay-bottom-glass", label: "Bottom Glass" },
    { id: "overlay-bottom-neon", label: "Bottom Neon" },
    { id: "overlay-bottom-minimal", label: "Bottom Minimal" },
    { id: "neon", label: "Neon Glow" },
    { id: "split", label: "Split Design" },
    { id: "gradient", label: "Gradient Flow" },
    { id: "outline", label: "Outline Text" },
    { id: "stacked", label: "Stacked Layout" },
    { id: "minimal", label: "Minimal Clean" },
    { id: "retro", label: "Retro Style" },
    { id: "glassmorphism", label: "Glass Effect" },
    { id: "3d", label: "3D Text" },
    { id: "vintage", label: "Vintage Look" },
    { id: "tech", label: "Tech Theme" },
    { id: "nature", label: "Nature Theme" },
    { id: "urban", label: "Urban Style" },
    { id: "artistic", label: "Artistic" }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Template Style</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="Select a template style" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {templates.map((template) => (
              <SelectItem 
                key={template.id} 
                value={template.id}
                className="hover:bg-muted focus:bg-muted"
              >
                {template.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="text_color">Text Color</Label>
        <div className="flex gap-4">
          <Input
            type="color"
            id="text_color"
            name="text_color"
            value={textColor}
            onChange={(e) => onTextColorChange(e.target.value)}
            className="w-16 h-10 p-1"
          />
          <Input
            type="text"
            value={textColor}
            onChange={(e) => onTextColorChange(e.target.value)}
            placeholder="#FFFFFF"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description_color">Description Color</Label>
        <div className="flex gap-4">
          <Input
            type="color"
            id="description_color"
            name="description_color"
            value={descriptionColor}
            onChange={(e) => onDescriptionColorChange(e.target.value)}
            className="w-16 h-10 p-1"
          />
          <Input
            type="text"
            value={descriptionColor}
            onChange={(e) => onDescriptionColorChange(e.target.value)}
            placeholder="#333333"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="overlay_color">Overlay Color</Label>
        <div className="flex gap-4">
          <Input
            type="color"
            id="overlay_color"
            name="overlay_color"
            value={overlayColor}
            onChange={(e) => onOverlayColorChange(e.target.value)}
            className="w-16 h-10 p-1"
          />
          <Input
            type="text"
            value={overlayColor}
            onChange={(e) => onOverlayColorChange(e.target.value)}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cta_color">CTA Button Color</Label>
        <div className="flex gap-4">
          <Input
            type="color"
            id="cta_color"
            name="cta_color"
            value={ctaColor}
            onChange={(e) => onCtaColorChange(e.target.value)}
            className="w-16 h-10 p-1"
          />
          <Input
            type="text"
            value={ctaColor}
            onChange={(e) => onCtaColorChange(e.target.value)}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Overlay Opacity</Label>
        <div className="flex gap-4 items-center">
          <Slider
            value={[overlayOpacity * 100]}
            onValueChange={(values) => onOpacityChange?.(values[0] / 100)}
            min={0}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-12 text-right">
            {Math.round(overlayOpacity * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
