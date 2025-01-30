import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";

interface TemplateStyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  accentColor: string;
  onColorChange: (value: string) => void;
  ctaColor: string;
  onCtaColorChange: (value: string) => void;
  overlayColor: string;
  onOverlayColorChange: (value: string) => void;
  overlayOpacity: number;
  onOpacityChange: (value: number) => void;
}

export function TemplateStyleSelector({
  value,
  onChange,
  accentColor,
  onColorChange,
  ctaColor,
  onCtaColorChange,
  overlayColor,
  onOverlayColorChange,
  overlayOpacity,
  onOpacityChange,
}: TemplateStyleSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Template Style</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minimal">Minimal</SelectItem>
            <SelectItem value="modern">Modern</SelectItem>
            <SelectItem value="elegant">Elegant</SelectItem>
            <SelectItem value="dynamic">Dynamic</SelectItem>
            <SelectItem value="spotlight">Spotlight</SelectItem>
            <SelectItem value="wave">Wave</SelectItem>
            <SelectItem value="cinematic">Cinematic</SelectItem>
            <SelectItem value="minimal-fade">Minimal Fade</SelectItem>
            <SelectItem value="duotone">Duotone</SelectItem>
            <SelectItem value="vignette">Vignette</SelectItem>
            <SelectItem value="luxury">Luxury</SelectItem>
            <SelectItem value="overlay-left">Overlay Left</SelectItem>
            <SelectItem value="overlay-right">Overlay Right</SelectItem>
            <SelectItem value="overlay-bottom">Overlay Bottom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Accent Color</Label>
        <Input
          type="color"
          value={accentColor}
          onChange={(e) => onColorChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>CTA Button Color</Label>
        <Input
          type="color"
          value={ctaColor}
          onChange={(e) => onCtaColorChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Overlay Color</Label>
        <Input
          type="color"
          value={overlayColor}
          onChange={(e) => onOverlayColorChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Overlay Opacity</Label>
        <Slider
          value={[overlayOpacity]}
          onValueChange={(values) => onOpacityChange(values[0])}
          min={0}
          max={1}
          step={0.1}
        />
      </div>
    </div>
  );
}