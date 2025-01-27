import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Input } from "./ui/input";

interface TemplateStyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  accentColor: string;
  onColorChange: (value: string) => void;
}

export function TemplateStyleSelector({ 
  value, 
  onChange,
  accentColor,
  onColorChange
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
          <div>
            <RadioGroupItem
              value="modern"
              id="modern"
              className="peer sr-only"
            />
            <Label
              htmlFor="modern"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Modern</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="elegant"
              id="elegant"
              className="peer sr-only"
            />
            <Label
              htmlFor="elegant"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Elegant</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="dynamic"
              id="dynamic"
              className="peer sr-only"
            />
            <Label
              htmlFor="dynamic"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Dynamic</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="spotlight"
              id="spotlight"
              className="peer sr-only"
            />
            <Label
              htmlFor="spotlight"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Spotlight</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="wave"
              id="wave"
              className="peer sr-only"
            />
            <Label
              htmlFor="wave"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Wave</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="cinematic"
              id="cinematic"
              className="peer sr-only"
            />
            <Label
              htmlFor="cinematic"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Cinematic</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="minimal-fade"
              id="minimal-fade"
              className="peer sr-only"
            />
            <Label
              htmlFor="minimal-fade"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Minimal Fade</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="duotone"
              id="duotone"
              className="peer sr-only"
            />
            <Label
              htmlFor="duotone"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Duotone</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="vignette"
              id="vignette"
              className="peer sr-only"
            />
            <Label
              htmlFor="vignette"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Vignette</span>
            </Label>
          </div>
        </RadioGroup>
      </div>
      <div className="space-y-2">
        <Label htmlFor="accent_color">Accent Color</Label>
        <div className="flex gap-4">
          <Input
            type="color"
            id="accent_color"
            name="accent_color"
            value={accentColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-16 h-10 p-1"
          />
          <Input
            type="text"
            value={accentColor}
            onChange={(e) => onColorChange(e.target.value)}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}