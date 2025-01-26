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
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [imageUrls, setImageUrls] = useState<ImageUrlState[]>([{ url: "", isValid: true, isChecking: false }]);

  if (!adData.template_style) {
    onStyleChange('minimal');
  }

  const checkImageUrl = async (url: string): Promise<boolean> => {
    if (!url) return false;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = async () => {
        try {
          const response = await fetch(url, { method: 'HEAD' });
          resolve(response.ok);
        } catch (error) {
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

    if (index === imageUrls.length - 1 && newUrl) {
      setImageUrls([...newImageUrls, { url: "", isValid: true, isChecking: false }]);
    }

    const validUrls = newImageUrls
      .filter(item => item.url && item.isValid)
      .map(item => item.url);
    onImageUrlsChange(validUrls);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Ad Name</Label>
        <Input
          id="name"
          name="name"
          value={adData.name}
          onChange={onInputChange}
          placeholder="Enter ad name"
          required
        />
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Images</TabsTrigger>
          <TabsTrigger value="urls">Image URLs</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <div className="space-y-2">
            <Label htmlFor="image">Images</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={onImageChange}
              multiple
              required
            />
          </div>
        </TabsContent>
        <TabsContent value="urls">
          <div className="space-y-4">
            <Label>Image URLs</Label>
            {imageUrls.map((imageUrl, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-grow space-y-2">
                  <Input
                    value={imageUrl.url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder="Enter image URL"
                  />
                  {imageUrl.url && !imageUrl.isValid && !imageUrl.isChecking && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Invalid URL or not an image
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                {imageUrl.url && !imageUrl.isChecking && imageUrl.isValid && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border">
                    <img
                      src={imageUrl.url}
                      alt="Preview"
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
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          name="headline"
          value={adData.headline}
          onChange={onInputChange}
          placeholder="Enter ad headline"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cta_text">CTA Text</Label>
        <Input
          id="cta_text"
          name="cta_text"
          value={adData.cta_text}
          onChange={onInputChange}
          placeholder="Enter button text"
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