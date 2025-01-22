import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fonts = [
  { name: "Heebo", url: "https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&display=swap" },
  { name: "Assistant", url: "https://fonts.googleapis.com/css2?family=Assistant:wght@400;700&display=swap" },
  { name: "Rubik", url: "https://fonts.googleapis.com/css2?family=Rubik:wght@400;700&display=swap" },
  { name: "Open Sans Hebrew", url: "https://fonts.googleapis.com/css2?family=Open+Sans+Hebrew:wght@400;700&display=swap" },
  { name: "Varela Round", url: "https://fonts.googleapis.com/css2?family=Varela+Round&display=swap" },
];

interface FontSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function FontSelector({ value, onChange }: FontSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">גופן</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="בחר גופן" />
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