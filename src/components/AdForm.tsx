import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FontSelector } from "./FontSelector";
import { PlatformSelector } from "./PlatformSelector";
import { TemplateStyleSelector } from "./TemplateStyleSelector";
import { LanguageSelector } from "./LanguageSelector";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface AdFormProps {
  adData: {
    name: string;
    headline: string;
    cta_text: string;
    font_url: string;
    platform: string;
    template_style: string;
    accent_color: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFontChange: (value: string) => void;
  onPlatformChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUrlsChange: (urls: string[]) => void;
}

export function AdForm({
  adData,
  onInputChange,
  onFontChange,
  onPlatformChange,
  onStyleChange,
  onColorChange,
  onImageChange,
  onImageUrlsChange,
}: AdFormProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("he");
  const [imageUrls, setImageUrls] = useState<string>("");

  // Ensure a default template style is set if none is selected
  if (!adData.template_style) {
    onStyleChange('minimal');
  }

  const handleImageUrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setImageUrls(e.target.value);
    const urls = e.target.value
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    onImageUrlsChange(urls);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">שם המודעה</Label>
        <Input
          id="name"
          name="name"
          value={adData.name}
          onChange={onInputChange}
          placeholder="הזן שם למודעה"
          className="text-right"
          required
        />
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">העלאת תמונות</TabsTrigger>
          <TabsTrigger value="urls">הזנת קישורים</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <div className="space-y-2">
            <Label htmlFor="image">תמונות</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="text-right"
              multiple
              required
            />
          </div>
        </TabsContent>
        <TabsContent value="urls">
          <div className="space-y-2">
            <Label htmlFor="imageUrls">קישורי תמונות</Label>
            <textarea
              id="imageUrls"
              value={imageUrls}
              onChange={handleImageUrlsChange}
              placeholder="הזן קישור לכל תמונה בשורה נפרדת"
              className="w-full min-h-[100px] p-2 border rounded-md text-right"
            />
          </div>
        </TabsContent>
      </Tabs>

      <LanguageSelector 
        value={selectedLanguage}
        onChange={setSelectedLanguage}
      />

      <PlatformSelector
        value={adData.platform}
        onChange={onPlatformChange}
      />

      <TemplateStyleSelector
        value={adData.template_style}
        onChange={onStyleChange}
        accentColor={adData.accent_color}
        onColorChange={onColorChange}
      />

      <div className="space-y-2">
        <Label htmlFor="headline">כותרת</Label>
        <Input
          id="headline"
          name="headline"
          value={adData.headline}
          onChange={onInputChange}
          placeholder="הזן כותרת למודעה"
          className="text-right"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cta_text">טקסט CTA</Label>
        <Input
          id="cta_text"
          name="cta_text"
          value={adData.cta_text}
          onChange={onInputChange}
          placeholder="הזן טקסט לכפתור"
          className="text-right"
          required
        />
      </div>

      <FontSelector 
        value={adData.font_url} 
        onChange={onFontChange}
        language={selectedLanguage}
      />
    </div>
  );
}