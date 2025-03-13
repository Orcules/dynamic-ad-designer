
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
    
    // Calculate contrasting border color for better visibility
    const contrastBorder = getContrastColor(scheme.overlayColor);
    
    // Enhance text visibility with higher contrast
    const enhancedTextColor = getContrastingTextColor(scheme.overlayColor);
    
    return {
      borderColor: contrastBorder,
      color: enhancedTextColor,
      backgroundColor: templateId === value ? scheme.overlayColor : 'transparent',
      hoverTextColor: scheme.textColor,
      hoverBgColor: `${scheme.overlayColor}80`, // 50% opacity for better hover visibility
      displayColor: scheme.ctaColor,
    };
  };
  
  // Helper to get contrasting color
  const getContrastColor = (hexColor: string) => {
    // Enhanced border contrast calculation
    try {
      // Make borders more visible by increasing color intensity
      if (hexColor.startsWith('#')) {
        // For dark colors, use a lighter contrasting border
        if (isColorDark(hexColor)) {
          return lightenColor(hexColor, 40);
        } 
        // For light colors, use a darker contrasting border
        return darkenColor(hexColor, 40);
      }
    } catch (e) {
      console.error("Error calculating contrast color:", e);
    }
    return hexColor;
  };
  
  // Helper to determine if a color is dark
  const isColorDark = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  };
  
  // Helper to get contrasting text color for better readability
  const getContrastingTextColor = (bgColor: string) => {
    return isColorDark(bgColor) ? '#FFFFFF' : '#000000';
  };
  
  // Helper to lighten a color
  const lightenColor = (hexColor: string, amount: number) => {
    return adjustColor(hexColor, amount);
  };
  
  // Helper to darken a color
  const darkenColor = (hexColor: string, amount: number) => {
    return adjustColor(hexColor, -amount);
  };
  
  // Helper to adjust a color's brightness
  const adjustColor = (hexColor: string, amount: number) => {
    try {
      const r = Math.max(0, Math.min(255, parseInt(hexColor.slice(1, 3), 16) + amount));
      const g = Math.max(0, Math.min(255, parseInt(hexColor.slice(3, 5), 16) + amount));
      const b = Math.max(0, Math.min(255, parseInt(hexColor.slice(5, 7), 16) + amount));
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } catch (e) {
      console.error("Error adjusting color:", e);
      return hexColor;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Template Style</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
          {templates.map((template) => {
            const styles = getTemplateButtonStyles(template.id);
            
            // Use a more visible indicator for the selected button
            const isSelected = template.id === value;
            
            return (
              <Button
                key={template.id}
                type="button"
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "flex justify-between items-center w-full relative",
                  // Add stronger border and improved visibility
                  "border-2 hover:border-opacity-100 transition-all duration-200",
                  // Apply text shadow for better text visibility
                  "text-shadow-sm",
                  isSelected && "ring-2 ring-offset-1"
                )}
                onClick={() => handleSelect(template.id)}
                style={{
                  // Apply direct styles for better visibility
                  borderColor: styles.borderColor,
                  color: isSelected ? styles.color : styles.color,
                  backgroundColor: isSelected ? styles.backgroundColor : 'rgba(0,0,0,0.1)',
                  textShadow: isColorDark(styles.backgroundColor) ? '0 0 2px rgba(0,0,0,0.8)' : '0 0 2px rgba(255,255,255,0.8)',
                }}
              >
                <span className="truncate mr-2 font-medium">
                  {template.label}
                </span>
                {isSelected && <Check className="h-4 w-4" />}
                
                {/* Add color indicator dot for better theme color visibility */}
                <div 
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: styles.displayColor }}
                ></div>
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

