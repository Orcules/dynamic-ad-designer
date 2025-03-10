
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getLanguageFonts } from './LanguageSelector';

// Helper function to convert font name to Google Fonts URL format
const getFontUrl = (fontName: string) => {
  return `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
};

interface FontSelectorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

export function FontSelector({ value, onChange, language }: FontSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const fonts = getLanguageFonts(language).map(fontName => ({
    name: fontName,
    url: getFontUrl(fontName)
  }));

  // Initialize font selection if none selected
  useEffect(() => {
    if (typeof onChange === 'function' && (!value || !fonts.some(font => font.url === value))) {
      onChange(fonts[0].url);
    }
  }, [language, value, onChange, fonts]);

  // Load all fonts to ensure they're available for preview and rendering
  useEffect(() => {
    fonts.forEach(font => {
      if (!loadedFonts.has(font.url)) {
        // Create and append a link element for each font
        const link = document.createElement('link');
        link.href = font.url;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        
        setLoadedFonts(prev => {
          const updated = new Set(prev);
          updated.add(font.url);
          return updated;
        });
        
        console.log(`Font loaded: ${font.name} (${font.url})`);
      }
    });
  }, [fonts, loadedFonts]);

  // Determine text direction based on language
  const isRTL = language === 'he' || language === 'ar';

  // When a font is selected, ensure it's loaded before applying
  const handleSelectFont = (fontUrl: string, fontName: string) => {
    // Make sure font is loaded before setting it
    if (!loadedFonts.has(fontUrl)) {
      const link = document.createElement('link');
      link.href = fontUrl;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      // Wait for font to load
      document.fonts.ready.then(() => {
        console.log(`Font loaded on demand: ${fontName}`);
        setLoadedFonts(prev => {
          const updated = new Set(prev);
          updated.add(fontUrl);
          return updated;
        });
        onChange(fontUrl);
      });
    } else {
      onChange(fontUrl);
    }
  };

  return (
    <div className="space-y-2 pointer-events-auto">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Font</Label>
        {fonts.length > 4 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs px-2 h-6"
          >
            {isExpanded ? "Show less" : "Show all"}
          </Button>
        )}
      </div>

      {isExpanded ? (
        <ScrollArea className="h-48 rounded-md border">
          <div className="grid grid-cols-2 gap-2 p-2">
            {fonts.map((font) => (
              <Button
                key={font.name}
                variant={font.url === value ? "default" : "outline"}
                className="w-full justify-start px-3 py-1 h-auto"
                onClick={() => handleSelectFont(font.url, font.name)}
                dir={isRTL ? "rtl" : "ltr"}
                style={{ fontFamily: `"${font.name}", ${isRTL ? 'sans-serif' : 'serif'}` }}
              >
                {font.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {fonts.slice(0, 4).map((font) => (
            <Button
              key={font.name}
              variant={font.url === value ? "default" : "outline"}
              className="w-full justify-start px-3 py-1 h-auto"
              onClick={() => handleSelectFont(font.url, font.name)}
              dir={isRTL ? "rtl" : "ltr"}
              style={{ fontFamily: `"${font.name}", ${isRTL ? 'sans-serif' : 'serif'}` }}
            >
              {font.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
