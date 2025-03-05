
import React, { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLanguageFonts } from './LanguageSelector';

const getFontUrl = (fontName: string) => {
  return `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
};

interface FontSelectorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

export function FontSelector({ value, onChange, language }: FontSelectorProps) {
  const fonts = getLanguageFonts(language).map(fontName => ({
    name: fontName,
    url: getFontUrl(fontName)
  }));

  useEffect(() => {
    if (typeof onChange === 'function' && (!value || !fonts.some(font => font.url === value))) {
      onChange(fonts[0].url);
    }
  }, [language, value, onChange, fonts]);

  // Determine text direction based on language
  const isRTL = language === 'he' || language === 'ar';

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Font</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-card" dir={isRTL ? "rtl" : "ltr"}>
          <SelectValue placeholder="Select font" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {fonts.map((font) => (
            <SelectItem 
              key={font.name} 
              value={font.url}
              className="hover:bg-muted focus:bg-muted"
              dir={isRTL ? "rtl" : "ltr"}
            >
              {font.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
