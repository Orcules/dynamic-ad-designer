
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

  // Load fonts only when they're selected
  useEffect(() => {
    if (!value) return;

    const link = document.createElement('link');
    link.href = value;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.crossOrigin = 'anonymous';
    link.setAttribute('as', 'style');
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [value]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Font</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-card">
          <SelectValue placeholder="Select font" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {fonts.map((font) => (
            <SelectItem 
              key={font.name} 
              value={font.url}
              className="hover:bg-muted focus:bg-muted"
            >
              {font.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
