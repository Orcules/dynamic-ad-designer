
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { useCallback } from "react";

// Define all available template styles
const templates = [
  // Basic styles
  { id: "minimal", label: "Minimal Clean" },
  { id: "modern", label: "Modern" },
  { id: "elegant", label: "Elegant" },
  { id: "dynamic", label: "Dynamic" },
  { id: "spotlight", label: "Spotlight" },
  
  // New banner & frame styles
  { id: "banner-top", label: "Top Banner" },
  { id: "banner-bottom", label: "Bottom Banner" },
  { id: "framed", label: "Frame Border" },
  { id: "corner-accent", label: "Corner Accent" },
  
  // Advanced styles
  { id: "tech-glow", label: "Tech Glow" },
  { id: "luxury-frame", label: "Luxury Frame" },
  { id: "luxury-jewelry", label: "Luxury Jewelry" }, // Add our new template
  
  // Overlay styles
  { id: "overlay-full", label: "Full Overlay" },
  { id: "overlay-bottom-clean", label: "Bottom Clean" },
  { id: "overlay-bottom-gradient", label: "Bottom Gradient" },
  { id: "overlay-bottom-glass", label: "Bottom Glass" },
  { id: "overlay-bottom-neon", label: "Bottom Neon" },
  { id: "overlay-bottom-minimal", label: "Bottom Minimal" },
  
  // Other styles
  { id: "wave", label: "Wave" },
  { id: "cinematic", label: "Cinematic" },
  { id: "minimal-fade", label: "Minimal Fade" },
  { id: "duotone", label: "Duotone" },
  { id: "vignette", label: "Vignette" },
  { id: "luxury", label: "Luxury" },
  { id: "retro", label: "Retro Style" },
  { id: "glassmorphism", label: "Glass Effect" },
  { id: "3d", label: "3D Text" },
  { id: "vintage", label: "Vintage Look" },
  { id: "tech", label: "Tech Theme" },
  { id: "nature", label: "Nature Theme" },
  { id: "urban", label: "Urban Style" },
  { id: "artistic", label: "Artistic" }
];

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
  
  // Simple function to handle template style selection
  const handleSelect = (templateId: string) => {
    if (templateId !== value) {
      onChange(templateId);
    }
  };

  const handleInputChange = useCallback((handler: (value: string) => void, value: string) => {
    handler(value);
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Template Style</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
          {templates.map((template) => (
            <Button
              key={template.id}
              type="button"
              variant={template.id === value ? "default" : "outline"}
              className="flex justify-between items-center w-full"
              onClick={() => handleSelect(template.id)}
            >
              <span className="truncate mr-2">
                {template.label}
              </span>
              {template.id === value && <Check className="h-4 w-4" />}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="text_color">Text Color</Label>
        <div className="flex gap-4">
          <Input
            type="color"
            id="text_color"
            name="text_color"
            value={textColor}
            onChange={(e) => handleInputChange(onTextColorChange, e.target.value)}
            className="w-16 h-10 p-1"
          />
          <Input
            type="text"
            value={textColor}
            onChange={(e) => handleInputChange(onTextColorChange, e.target.value)}
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
            onChange={(e) => handleInputChange(onDescriptionColorChange, e.target.value)}
            className="w-16 h-10 p-1"
          />
          <Input
            type="text"
            value={descriptionColor}
            onChange={(e) => handleInputChange(onDescriptionColorChange, e.target.value)}
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
            onChange={(e) => handleInputChange(onOverlayColorChange, e.target.value)}
            className="w-16 h-10 p-1"
          />
          <Input
            type="text"
            value={overlayColor}
            onChange={(e) => handleInputChange(onOverlayColorChange, e.target.value)}
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
            onChange={(e) => handleInputChange(onCtaColorChange, e.target.value)}
            className="w-16 h-10 p-1"
          />
          <Input
            type="text"
            value={ctaColor}
            onChange={(e) => handleInputChange(onCtaColorChange, e.target.value)}
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
            onValueChange={(values) => {
              onOpacityChange?.(values[0] / 100);
            }}
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
