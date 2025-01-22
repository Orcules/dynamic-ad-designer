import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const platforms = [
  { id: "facebook", name: "פייסבוק", dimensions: "1200 x 628" },
  { id: "instagram", name: "אינסטגרם", dimensions: "1080 x 1080" },
  { id: "linkedin", name: "לינקדאין", dimensions: "1200 x 627" },
  { id: "twitter", name: "טוויטר", dimensions: "1600 x 900" },
];

interface PlatformSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">פלטפורמה</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="בחר פלטפורמה" />
        </SelectTrigger>
        <SelectContent>
          {platforms.map((platform) => (
            <SelectItem key={platform.id} value={platform.id}>
              {platform.name} ({platform.dimensions})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}