import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fontsByLanguage = {
  he: [
    { name: "Heebo", url: "https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&display=swap" },
    { name: "Assistant", url: "https://fonts.googleapis.com/css2?family=Assistant:wght@400;700&display=swap" },
    { name: "Rubik", url: "https://fonts.googleapis.com/css2?family=Rubik:wght@400;700&display=swap" },
    { name: "Open Sans Hebrew", url: "https://fonts.googleapis.com/css2?family=Open+Sans+Hebrew:wght@400;700&display=swap" },
    { name: "Varela Round", url: "https://fonts.googleapis.com/css2?family=Varela+Round&display=swap" },
  ],
  en: [
    { name: "Inter", url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" },
    { name: "Roboto", url: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" },
    { name: "Poppins", url: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap" },
    { name: "Montserrat", url: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" },
  ],
  ar: [
    { name: "Cairo", url: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" },
    { name: "Tajawal", url: "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" },
    { name: "Almarai", url: "https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&display=swap" },
    { name: "Amiri", url: "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" },
  ],
};

interface FontSelectorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

export function FontSelector({ value, onChange, language }: FontSelectorProps) {
  const fonts = fontsByLanguage[language as keyof typeof fontsByLanguage] || fontsByLanguage.he;

  // Set default font if none selected or if language changes
  React.useEffect(() => {
    if (!value || !fonts.some(font => font.url === value)) {
      onChange(fonts[0].url);
    }
  }, [language, value, onChange]);

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