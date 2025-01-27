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

export function TemplateStyleSelector({ value, onChange }: TemplateStyleSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select style" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="minimal">Minimal</SelectItem>
        <SelectItem value="dynamic">Dynamic</SelectItem>
        <SelectItem value="spotlight">Spotlight</SelectItem>
        <SelectItem value="wave">Wave</SelectItem>
        <SelectItem value="geometric">Geometric</SelectItem>
      </SelectContent>
    </Select>
  );
}