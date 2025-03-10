
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const languages = [
  { code: "en", name: "English", fonts: ["Inter", "Roboto", "Poppins", "Montserrat"] },
  { code: "he", name: "עברית", fonts: ["Heebo", "Assistant", "Rubik", "Open Sans Hebrew"] },
  { code: "ar", name: "العربية", fonts: ["Cairo", "Tajawal", "Almarai", "Amiri"] },
  { code: "es", name: "Spanish", fonts: ["Montserrat", "Lato", "Open Sans", "Roboto"] },
  { code: "fr", name: "French", fonts: ["Montserrat", "Lato", "Open Sans", "Roboto"] },
  { code: "de", name: "German", fonts: ["Montserrat", "Lato", "Open Sans", "Roboto"] },
  { code: "it", name: "Italian", fonts: ["Montserrat", "Lato", "Open Sans", "Roboto"] },
  { code: "pt", name: "Portuguese", fonts: ["Montserrat", "Lato", "Open Sans", "Roboto"] },
  { code: "ru", name: "Russian", fonts: ["Montserrat", "Lato", "Open Sans", "Roboto"] },
  { code: "zh", name: "Chinese", fonts: ["Noto Sans SC", "Source Han Sans CN", "Microsoft YaHei"] },
  { code: "ja", name: "Japanese", fonts: ["Noto Sans JP", "Source Han Sans JP", "Hiragino Kaku Gothic Pro"] },
  { code: "ko", name: "Korean", fonts: ["Noto Sans KR", "Source Han Sans KR", "Malgun Gothic"] },
];

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="space-y-2 pointer-events-auto">
      <label className="text-sm font-medium">Language</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-card pointer-events-auto">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent 
          className="bg-card border-border z-[100] pointer-events-auto"
          position="popper"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
        >
          {languages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              className="hover:bg-muted focus:bg-muted pointer-events-auto"
              dir={lang.code === "he" || lang.code === "ar" ? "rtl" : "ltr"}
            >
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export const getLanguageFonts = (languageCode: string) => {
  const language = languages.find(lang => lang.code === languageCode);
  return language?.fonts || languages[0].fonts; // Default to English fonts if language not found
};
