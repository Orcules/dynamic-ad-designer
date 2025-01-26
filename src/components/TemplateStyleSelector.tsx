import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const styles = [
  { 
    id: "minimal", 
    name: "Minimal", 
    description: "Clean and simple design",
    defaultColor: "#4A90E2"
  },
  { 
    id: "modern", 
    name: "Modern", 
    description: "Contemporary and dynamic",
    defaultColor: "#FF4B2B"
  },
  { 
    id: "bold", 
    name: "Bold", 
    description: "Strong and attention-grabbing",
    defaultColor: "#8B5CF6"
  },
  { 
    id: "elegant", 
    name: "Elegant", 
    description: "Refined and luxurious",
    defaultColor: "#D946EF"
  },
];

interface TemplateStyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  accentColor: string;
  onColorChange: (color: string) => void;
}

export function TemplateStyleSelector({ 
  value, 
  onChange, 
  accentColor, 
  onColorChange 
}: TemplateStyleSelectorProps) {
  const handleStyleChange = (newValue: string) => {
    onChange(newValue);
    const style = styles.find(s => s.id === newValue);
    if (style) {
      onColorChange(style.defaultColor);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Design Style</Label>
        <Select value={value} onValueChange={handleStyleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            {styles.map((style) => (
              <SelectItem key={style.id} value={style.id}>
                {style.name} - {style.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Custom Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
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