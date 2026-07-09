
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-2 pointer-events-auto">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Language</Label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs px-2 h-6"
        >
          {isExpanded ? "Show less" : "Show all"}
        </Button>
      </div>

      {isExpanded ? (
        <ScrollArea className="h-48 rounded-md border">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant={lang.code === value ? "default" : "outline"}
                className="w-full justify-start px-3 py-1 h-auto"
                onClick={() => onChange(lang.code)}
                dir={lang.code === "he" || lang.code === "ar" ? "rtl" : "ltr"}
              >
                {lang.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {languages.slice(0, 6).map((lang) => (
            <Button
              key={lang.code}
              variant={lang.code === value ? "default" : "outline"}
              className="w-full justify-start px-3 py-1 h-auto"
              onClick={() => onChange(lang.code)}
              dir={lang.code === "he" || lang.code === "ar" ? "rtl" : "ltr"}
            >
              {lang.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export const getLanguageFonts = (languageCode: string) => {
  const language = languages.find(lang => lang.code === languageCode);
  return language?.fonts || languages[0].fonts; // Default to English fonts if language not found
};
