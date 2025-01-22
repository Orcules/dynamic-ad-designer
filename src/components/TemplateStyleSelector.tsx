import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const styles = [
  { id: "minimal", name: "מינימליסטי", description: "עיצוב נקי ופשוט" },
  { id: "modern", name: "מודרני", description: "עיצוב עדכני ודינמי" },
  { id: "bold", name: "בולט", description: "עיצוב חזק ומושך תשומת לב" },
  { id: "elegant", name: "אלגנטי", description: "עיצוב מעודן ויוקרתי" },
];

interface TemplateStyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TemplateStyleSelector({ value, onChange }: TemplateStyleSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">סגנון עיצוב</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="בחר סגנון" />
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
  );
}