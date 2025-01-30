import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";

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
  onOverlayColorChange
}: TemplateStyleSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Template Style</Label>
        <RadioGroup
          value={value}
          onValueChange={onChange}
          className="grid grid-cols-2 gap-4"
        >
          <StyleOption id="neon" label="Neon" />
          <StyleOption id="split" label="Split" />
          <StyleOption id="gradient" label="Gradient" />
          <StyleOption id="outline" label="Outline" />
          <StyleOption id="stacked" label="Stacked" />
          <StyleOption id="minimal" label="Minimal" />
        </RadioGroup>
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

function StyleOption({ id, label }: { id: string; label: string }) {
  return (
    <div>
      <RadioGroupItem
        value={id}
        id={id}
        className="peer sr-only"
      />
      <Label
        htmlFor={id}
        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
      >
        <span>{label}</span>
      </Label>
    </div>
  );
}