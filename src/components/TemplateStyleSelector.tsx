import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

export const templateColorSchemes = {
  // Basic styles
  "minimal": {
    textColor: "#333333",
    descriptionColor: "#666666",
    overlayColor: "#FFFFFF",
    ctaColor: "#000000",
    overlayOpacity: 0.2
  },
  "modern": {
    textColor: "#FFFFFF",
    descriptionColor: "#F0F0F0",
    overlayColor: "#000000",
    ctaColor: "#4A90E2",
    overlayOpacity: 0.4
  },
  "elegant": {
    textColor: "#F8F0E3",
    descriptionColor: "#E8D9C5",
    overlayColor: "#2D2A24",
    ctaColor: "#C9A87C",
    overlayOpacity: 0.5
  },
  "dynamic": {
    textColor: "#FFFFFF",
    descriptionColor: "#E0E0E0",
    overlayColor: "#1E3A8A",
    ctaColor: "#F59E0B",
    overlayOpacity: 0.6
  },
  "spotlight": {
    textColor: "#FFFFFF",
    descriptionColor: "#CCCCCC",
    overlayColor: "#000000",
    ctaColor: "#FF4500",
    overlayOpacity: 0.7
  },
  
  // Banner & frame styles
  "banner-top": {
    textColor: "#FFFFFF",
    descriptionColor: "#E6E6E6",
    overlayColor: "#3B82F6",
    ctaColor: "#1D4ED8",
    overlayOpacity: 0.85
  },
  "banner-bottom": {
    textColor: "#FFFFFF",
    descriptionColor: "#E6E6E6",
    overlayColor: "#4B5563",
    ctaColor: "#1F2937",
    overlayOpacity: 0.85
  },
  "framed": {
    textColor: "#333333",
    descriptionColor: "#555555",
    overlayColor: "#FFFFFF",
    ctaColor: "#000000",
    overlayOpacity: 0.15
  },
  "corner-accent": {
    textColor: "#1F2937",
    descriptionColor: "#4B5563",
    overlayColor: "#F3F4F6",
    ctaColor: "#6366F1",
    overlayOpacity: 0.2
  },
  
  // Advanced styles
  "tech-glow": {
    textColor: "#C2FDFF",
    descriptionColor: "#7BB4D4",
    overlayColor: "#071D3A",
    ctaColor: "#00FFFF",
    overlayOpacity: 0.6
  },
  "luxury-frame": {
    textColor: "#F9F2D6",
    descriptionColor: "#E6D89C",
    overlayColor: "#2C201D",
    ctaColor: "#D4AF37",
    overlayOpacity: 0.4
  },
  "luxury-jewelry": {
    textColor: "#F9F2D6",
    descriptionColor: "#E6D89C",
    overlayColor: "#c5022e",
    ctaColor: "#f8e9b0",
    overlayOpacity: 0.3
  },
  
  // Overlay styles
  "overlay-full": {
    textColor: "#FFFFFF",
    descriptionColor: "#E0E0E0",
    overlayColor: "#000000",
    ctaColor: "#FFFFFF",
    overlayOpacity: 0.7
  },
  "overlay-bottom-clean": {
    textColor: "#FFFFFF",
    descriptionColor: "#E6E6E6",
    overlayColor: "#000000",
    ctaColor: "#FFFFFF",
    overlayOpacity: 0.8
  },
  "overlay-bottom-gradient": {
    textColor: "#FFFFFF",
    descriptionColor: "#F0F0F0",
    overlayColor: "#222222",
    ctaColor: "#FFFFFF",
    overlayOpacity: 0.9
  },
  "overlay-bottom-glass": {
    textColor: "#FFFFFF",
    descriptionColor: "#E0E0E0",
    overlayColor: "#4B5563",
    ctaColor: "#FFFFFF",
    overlayOpacity: 0.4
  },
  "overlay-bottom-neon": {
    textColor: "#00FFFF",
    descriptionColor: "#E100FF",
    overlayColor: "#0D0221",
    ctaColor: "#0FFF50",
    overlayOpacity: 0.85
  },
  "overlay-bottom-minimal": {
    textColor: "#FFFFFF",
    descriptionColor: "#E6E6E6",
    overlayColor: "#000000",
    ctaColor: "#FFFFFF",
    overlayOpacity: 0.6
  },
  
  // Other styles
  "wave": {
    textColor: "#FFFFFF",
    descriptionColor: "#E0F7FA",
    overlayColor: "#01579B",
    ctaColor: "#00B0FF",
    overlayOpacity: 0.6
  },
  "cinematic": {
    textColor: "#FFFFFF",
    descriptionColor: "#B0B0B0",
    overlayColor: "#000000",
    ctaColor: "#E50914",
    overlayOpacity: 0.5
  },
  "minimal-fade": {
    textColor: "#333333",
    descriptionColor: "#555555",
    overlayColor: "#FFFFFF",
    ctaColor: "#000000",
    overlayOpacity: 0.7
  },
  "duotone": {
    textColor: "#FFFFFF",
    descriptionColor: "#F0F0F0",
    overlayColor: "#8A2BE2",
    ctaColor: "#4B0082",
    overlayOpacity: 0.5
  },
  "vignette": {
    textColor: "#FFFFFF",
    descriptionColor: "#E0E0E0",
    overlayColor: "#000000",
    ctaColor: "#FFFFFF",
    overlayOpacity: 0.6
  },
  "luxury": {
    textColor: "#F9F2D6",
    descriptionColor: "#D4C69E",
    overlayColor: "#1A1812",
    ctaColor: "#D4AF37",
    overlayOpacity: 0.4
  },
  "retro": {
    textColor: "#F5F5DC",
    descriptionColor: "#D3CBAE",
    overlayColor: "#8B4513",
    ctaColor: "#CD853F",
    overlayOpacity: 0.5
  },
  "glassmorphism": {
    textColor: "#FFFFFF",
    descriptionColor: "#E0E0E0",
    overlayColor: "#FFFFFF",
    ctaColor: "#3B82F6",
    overlayOpacity: 0.15
  },
  "3d": {
    textColor: "#FFFFFF",
    descriptionColor: "#CCCCCC",
    overlayColor: "#1E293B",
    ctaColor: "#6EE7B7",
    overlayOpacity: 0.7
  },
  "vintage": {
    textColor: "#F2E8DC",
    descriptionColor: "#D8CFC2",
    overlayColor: "#5E503F",
    ctaColor: "#C6AC8F",
    overlayOpacity: 0.5
  },
  "tech": {
    textColor: "#E2E8F0",
    descriptionColor: "#CBD5E1",
    overlayColor: "#0F172A",
    ctaColor: "#10B981",
    overlayOpacity: 0.7
  },
  "nature": {
    textColor: "#FFFFFF",
    descriptionColor: "#E0E0E0",
    overlayColor: "#2D3B2D",
    ctaColor: "#4CAF50",
    overlayOpacity: 0.4
  },
  "urban": {
    textColor: "#FFFFFF",
    descriptionColor: "#CCCCCC",
    overlayColor: "#1F2937",
    ctaColor: "#F97316",
    overlayOpacity: 0.6
  },
  "artistic": {
    textColor: "#FFFFFF",
    descriptionColor: "#E6E6E6",
    overlayColor: "#5D4037",
    ctaColor: "#FF9800",
    overlayOpacity: 0.5
  }
};

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
  { id: "luxury-jewelry", label: "Luxury Jewelry" },
  
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
  
  const handleSelect = (templateId: string) => {
    if (templateId !== value) {
      onChange(templateId);
      
      if (templateColorSchemes[templateId]) {
        const scheme = templateColorSchemes[templateId];
        onTextColorChange(scheme.textColor);
        onDescriptionColorChange(scheme.descriptionColor);
        onOverlayColorChange(scheme.overlayColor);
        onCtaColorChange(scheme.ctaColor);
        if (onOpacityChange) {
          onOpacityChange(scheme.overlayOpacity);
        }
      }
    }
  };

  const handleInputChange = useCallback((handler: (value: string) => void, value: string) => {
    handler(value);
  }, []);
  
  // Function to get styles for a template button based on its color scheme
  const getTemplateButtonStyles = (templateId: string) => {
    if (!templateColorSchemes[templateId]) return {};
    
    const scheme = templateColorSchemes[templateId];
    return {
      borderColor: scheme.ctaColor,
      color: scheme.textColor,
      backgroundColor: templateId === value ? scheme.overlayColor : 'transparent',
      hoverTextColor: scheme.textColor,
      hoverBgColor: `${scheme.overlayColor}20` // 20% opacity version of overlay color
    };
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Template Style</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
          {templates.map((template) => {
            const styles = getTemplateButtonStyles(template.id);
            return (
              <Button
                key={template.id}
                type="button"
                variant={template.id === value ? "default" : "outline"}
                className={cn(
                  "flex justify-between items-center w-full",
                  // Apply custom styling based on the template's color scheme
                  `border-[${styles.borderColor}]`,
                  `text-[${styles.color}]`,
                  `hover:text-[${styles.hoverTextColor}]`,
                  `hover:bg-[${styles.hoverBgColor}]`,
                  template.id === value && `bg-[${styles.backgroundColor}]`,
                  // Keep the specific styling for luxury-jewelry as it was before
                  template.id === "luxury-jewelry" && "border-[#f8e9b0] text-[#f8e9b0] hover:text-[#f8e9b0] hover:bg-[#c5022e]/20",
                  template.id === value && template.id === "luxury-jewelry" && "bg-[#c5022e] text-[#f8e9b0]"
                )}
                onClick={() => handleSelect(template.id)}
                style={{
                  // Applying colors directly through style to ensure they work with dynamic values
                  borderColor: styles.borderColor,
                  color: styles.color,
                  backgroundColor: template.id === value ? styles.backgroundColor : 'transparent',
                }}
              >
                <span className="truncate mr-2">
                  {template.label}
                </span>
                {template.id === value && <Check className="h-4 w-4" />}
              </Button>
            );
          })}
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
