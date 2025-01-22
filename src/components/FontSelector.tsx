import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fonts = [
  { name: "Inter", url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" },
  { name: "Roboto", url: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" },
  { name: "Playfair Display", url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" },
  { name: "Montserrat", url: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" },
];

interface FontSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function FontSelector({ value, onChange }: FontSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Font Family</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select font" />
        </SelectTrigger>
        <SelectContent>
          {fonts.map((font) => (
            <SelectItem key={font.name} value={font.url}>
              {font.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}