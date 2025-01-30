import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TemplateStyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TemplateStyleSelector({
  value,
  onChange,
}: TemplateStyleSelectorProps) {
  return (
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
  );
}