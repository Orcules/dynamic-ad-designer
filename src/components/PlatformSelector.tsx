
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

const platforms = [
  { id: "facebook", name: "Facebook", dimensions: "1200 x 628" },
  { id: "taboola", name: "Taboola", dimensions: "1200 x 628" },
  { id: "google", name: "Google", dimensions: "1200 x 628" },
  { id: "instagram", name: "Instagram", dimensions: "1080 x 1080" },
  { id: "instagram-story", name: "Instagram Story", dimensions: "1080 x 1350" },
];

interface PlatformSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  const [selected, setSelected] = useState(value);
  
  // Update local state when parent value changes
  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleValueChange = (newValue: string) => {
    if (newValue === selected) return;
    
    // Set local state
    setSelected(newValue);
    
    // Update parent component
    onChange(newValue);
  };
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Platform</label>
      <Select value={selected} onValueChange={handleValueChange}>
        <SelectTrigger className="bg-card">
          <SelectValue placeholder="Select platform" />
        </SelectTrigger>
        <SelectContent 
          className="bg-card border-border z-[100]"
          position="popper"
          align="center"
          side="bottom"
          sideOffset={4}
        >
          {platforms.map((platform) => (
            <SelectItem 
              key={platform.id} 
              value={platform.id}
              className="hover:bg-muted focus:bg-muted cursor-pointer"
            >
              {platform.name} ({platform.dimensions})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
