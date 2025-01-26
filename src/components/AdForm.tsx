import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FontSelector } from "./FontSelector";
import { PlatformSelector } from "./PlatformSelector";
import { TemplateStyleSelector } from "./TemplateStyleSelector";
import { LanguageSelector } from "./LanguageSelector";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";

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

interface ImageUrlState {
  url: string;
  isValid: boolean;
  isChecking: boolean;
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
  const [imageUrls, setImageUrls] = useState<ImageUrlState[]>([{ url: "", isValid: true, isChecking: false }]);

  // Ensure a default template style is set if none is selected
  if (!adData.template_style) {
    onStyleChange('minimal');
  }

  const checkImageUrl = async (url: string): Promise<boolean> => {
    if (!url) return false;
    
    // Try loading the image directly first
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = async () => {
        try {
          // Fallback to HEAD request if direct loading fails
          const response = await fetch(url, { method: 'HEAD' });
          resolve(response.ok);
        } catch (error) {
          // If both methods fail, try one last time with a direct GET request
          try {
            const response = await fetch(url);
            resolve(response.ok);
          } catch (error) {
            resolve(false);
          }
        }
      };
      img.src = url;
    });
  };

  const handleUrlChange = async (index: number, newUrl: string) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = { url: newUrl, isValid: true, isChecking: true };
    setImageUrls(newImageUrls);

    if (newUrl) {
      const isValid = await checkImageUrl(newUrl);
      newImageUrls[index] = { url: newUrl, isValid, isChecking: false };
      setImageUrls(newImageUrls);
    }

    // Add new empty field if this is the last one and it's not empty
    if (index === imageUrls.length - 1 && newUrl) {
      setImageUrls([...newImageUrls, { url: "", isValid: true, isChecking: false }]);
    }

    // Update parent component with valid URLs
    const validUrls = newImageUrls
      .filter(item => item.url && item.isValid)
      .map(item => item.url);
    onImageUrlsChange(validUrls);
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
          <div className="space-y-4">
            <Label>קישורי תמונות</Label>
            {imageUrls.map((imageUrl, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-grow space-y-2">
                  <Input
                    value={imageUrl.url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder="הכנס קישור לתמונה"
                    className="text-right"
                  />
                  {imageUrl.url && !imageUrl.isValid && !imageUrl.isChecking && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        הקישור אינו תקין או שאינו מוביל לתמונה
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                {imageUrl.url && !imageUrl.isChecking && imageUrl.isValid && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border">
                    <img
                      src={imageUrl.url}
                      alt="תצוגה מקדימה"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
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