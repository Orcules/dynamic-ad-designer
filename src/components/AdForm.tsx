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
import { Slider } from "./ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

interface Position {
  x: number;
  y: number;
}

interface ImageUrlState {
  url: string;
  isValid: boolean;
  isChecking: boolean;
}

interface ImagePreview {
  file: File;
  preview: string;
}

interface AdFormProps {
  adData: {
    name: string;
    headline: string;
    description: string;
    cta_text: string;
    font_url: string;
    platform: string;
    template_style: string;
    accent_color: string;
    cta_color: string;
    overlay_color: string;
    text_color: string;
    description_color: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFontChange: (value: string) => void;
  onPlatformChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onCtaColorChange: (value: string) => void;
  onOverlayColorChange: (value: string) => void;
  onTextColorChange: (value: string) => void;
  onDescriptionColorChange: (value: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUrlsChange: (urls: string[]) => void;
  overlayOpacity: number;
  onOpacityChange: (value: number) => void;
  headlinePosition: Position;
  descriptionPosition: Position;
  ctaPosition: Position;
  imagePosition: Position;
  onHeadlinePositionChange: (position: Position) => void;
  onDescriptionPositionChange: (position: Position) => void;
  onCtaPositionChange: (position: Position) => void;
  onImagePositionChange: (position: Position) => void;
}

export function AdForm({
  adData,
  onInputChange,
  onFontChange,
  onPlatformChange,
  onStyleChange,
  onColorChange,
  onCtaColorChange,
  onOverlayColorChange,
  onTextColorChange,
  onDescriptionColorChange,
  onImageChange,
  onImageUrlsChange,
  overlayOpacity,
  onOpacityChange,
  headlinePosition,
  descriptionPosition,
  ctaPosition,
  imagePosition,
  onHeadlinePositionChange,
  onDescriptionPositionChange,
  onCtaPositionChange,
  onImagePositionChange,
}: AdFormProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [imageUrls, setImageUrls] = useState<ImageUrlState[]>([{ url: "", isValid: true, isChecking: false }]);
  const [uploadedImages, setUploadedImages] = useState<ImagePreview[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const checkImageUrl = async (url: string): Promise<boolean> => {
    if (!url) return false;
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) return true;

      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const proxyResponse = await fetch(proxyUrl);
      if (proxyResponse.ok) return true;

      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    } catch (error) {
      console.error('Error checking image URL:', error);
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    }
  };

  const handleUrlChange = async (index: number, newUrl: string) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = { url: newUrl, isValid: true, isChecking: true };
    setImageUrls(newImageUrls);

    if (newUrl) {
      const isValid = await checkImageUrl(newUrl);
      newImageUrls[index] = { url: newUrl, isValid, isChecking: false };
      setImageUrls(newImageUrls);

      const validUrls = newImageUrls
        .filter(item => item.url && item.isValid)
        .map(item => item.url);
      onImageUrlsChange(validUrls);
      
      if (isValid) {
        setCurrentImageIndex(index);
      }
    }

    if (index === imageUrls.length - 1 && newUrl) {
      setImageUrls([...newImageUrls, { url: "", isValid: true, isChecking: false }]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newPreviews = files.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      
      const newUploadedImages = [...uploadedImages, ...newPreviews];
      setUploadedImages(newUploadedImages);
      
      if (newUploadedImages.length > 0) {
        setCurrentImageIndex(newUploadedImages.length - 1);
      }
      
      onImageChange(e);
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].preview);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  useEffect(() => {
    return () => {
      uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, []);

  const getCollageStyle = (index: number, total: number) => {
    if (total === 1) return "col-span-2 row-span-2";
    if (total === 2) return "col-span-1 row-span-2";
    if (total === 3 && index === 0) return "col-span-2 row-span-1";
    if (total === 4) return "col-span-1 row-span-1";
    return "";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ad Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={adData.description}
              onChange={onInputChange}
              placeholder="Enter ad description"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Element Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="flex justify-between items-center">
              <span>Background Image Position</span>
              {(uploadedImages.length > 1 || imageUrls.filter(u => u.url && u.isValid).length > 1) && (
                <select 
                  className="text-xs border rounded p-1"
                  value={currentImageIndex}
                  onChange={(e) => setCurrentImageIndex(Number(e.target.value))}
                >
                  {uploadedImages.map((_, i) => (
                    <option key={`uploaded-${i}`} value={i}>
                      Uploaded Image {i + 1}
                    </option>
                  ))}
                  {imageUrls
                    .filter(u => u.url && u.isValid)
                    .map((_, i) => (
                      <option key={`url-${i}`} value={i + uploadedImages.length}>
                        URL Image {i + 1}
                      </option>
                    ))}
                </select>
              )}
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label htmlFor="image-x" className="text-xs">X</Label>
                <Input
                  id="image-x"
                  type="number"
                  value={imagePosition.x}
                  onChange={(e) => onImagePositionChange({ 
                    ...imagePosition, 
                    x: Number(e.target.value) 
                  })}
                />
              </div>
              <div>
                <Label htmlFor="image-y" className="text-xs">Y</Label>
                <Input
                  id="image-y"
                  type="number"
                  value={imagePosition.y}
                  onChange={(e) => onImagePositionChange({ 
                    ...imagePosition, 
                    y: Number(e.target.value) 
                  })}
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Headline Position</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label htmlFor="headline-x" className="text-xs">X</Label>
                <Input
                  id="headline-x"
                  type="number"
                  value={headlinePosition.x}
                  onChange={(e) => onHeadlinePositionChange({ 
                    ...headlinePosition, 
                    x: Number(e.target.value) 
                  })}
                />
              </div>
              <div>
                <Label htmlFor="headline-y" className="text-xs">Y</Label>
                <Input
                  id="headline-y"
                  type="number"
                  value={headlinePosition.y}
                  onChange={(e) => onHeadlinePositionChange({ 
                    ...headlinePosition, 
                    y: Number(e.target.value) 
                  })}
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Description Position</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label htmlFor="description-x" className="text-xs">X</Label>
                <Input
                  id="description-x"
                  type="number"
                  value={descriptionPosition.x}
                  onChange={(e) => onDescriptionPositionChange({ 
                    ...descriptionPosition, 
                    x: Number(e.target.value) 
                  })}
                />
              </div>
              <div>
                <Label htmlFor="description-y" className="text-xs">Y</Label>
                <Input
                  id="description-y"
                  type="number"
                  value={descriptionPosition.y}
                  onChange={(e) => onDescriptionPositionChange({ 
                    ...descriptionPosition, 
                    y: Number(e.target.value) 
                  })}
                />
              </div>
            </div>
          </div>

          <div>
            <Label>CTA Position</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label htmlFor="cta-x" className="text-xs">X</Label>
                <Input
                  id="cta-x"
                  type="number"
                  value={ctaPosition.x}
                  onChange={(e) => onCtaPositionChange({ 
                    ...ctaPosition, 
                    x: Number(e.target.value) 
                  })}
                />
              </div>
              <div>
                <Label htmlFor="cta-y" className="text-xs">Y</Label>
                <Input
                  id="cta-y"
                  type="number"
                  value={ctaPosition.y}
                  onChange={(e) => onCtaPositionChange({ 
                    ...ctaPosition, 
                    y: Number(e.target.value) 
                  })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <LanguageSelector 
        value={selectedLanguage}
        onChange={setSelectedLanguage}
      />

      <PlatformSelector
        value={adData.platform}
        onChange={onPlatformChange}
      />

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Images</TabsTrigger>
          <TabsTrigger value="urls">Image URLs</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <div className="space-y-4">
            <Label htmlFor="image">Images</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              multiple
              required
            />
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 grid-rows-2 gap-2 h-64">
                {uploadedImages.map((img, index) => (
                  <div 
                    key={index} 
                    className={`relative group overflow-hidden rounded-lg ${getCollageStyle(index, uploadedImages.length)}`}
                  >
                    <img
                      src={img.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => removeUploadedImage(index)}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                      crossOrigin="anonymous"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <TemplateStyleSelector
        value={adData.template_style}
        onChange={onStyleChange}
        accentColor={adData.accent_color}
        onColorChange={onColorChange}
        ctaColor={adData.cta_color}
        onCtaColorChange={onCtaColorChange}
        overlayColor={adData.overlay_color}
        onOverlayColorChange={onOverlayColorChange}
        textColor={adData.text_color}
        onTextColorChange={onTextColorChange}
        descriptionColor={adData.description_color}
        onDescriptionColorChange={onDescriptionColorChange}
        overlayOpacity={overlayOpacity}
        onOpacityChange={onOpacityChange}
      />

      <FontSelector 
        value={adData.font_url} 
        onChange={onFontChange}
        language={selectedLanguage}
      />
    </div>
  );
}
