import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FontSelector } from "./FontSelector";
import { PlatformSelector } from "./PlatformSelector";
import { TemplateStyleSelector } from "./TemplateStyleSelector";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Template {
  id: string;
  title: string;
  dimensions: string;
  imageUrl: string;
  description: string;
}

interface AdEditorProps {
  template: Template;
  onAdGenerated: (adData: any) => void;
}

const AdEditor: React.FC<AdEditorProps> = ({ template, onAdGenerated }) => {
  const [adData, setAdData] = useState({
    name: "",
    headline: "",
    cta_text: "",
    font_url: "",
    platform: "",
    template_style: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleFontChange = (value: string) => {
    setAdData((prev) => ({
      ...prev,
      font_url: value,
    }));
  };

  const handlePlatformChange = (value: string) => {
    setAdData((prev) => ({
      ...prev,
      platform: value,
    }));
  };

  const handleStyleChange = (value: string) => {
    setAdData((prev) => ({
      ...prev,
      template_style: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage) {
      toast.error('נא לבחור תמונה');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Get dimensions based on platform
      let width, height;
      switch (adData.platform) {
        case "facebook":
          width = 1200;
          height = 628;
          break;
        case "instagram":
          width = 1080;
          height = 1080;
          break;
        case "linkedin":
          width = 1200;
          height = 627;
          break;
        case "twitter":
          width = 1600;
          height = 900;
          break;
        default:
          width = 1200;
          height = 628;
      }

      // Upload the image first
      const timestamp = Date.now();
      const fileExt = selectedImage.name.split('.').pop();
      const filePath = `${timestamp}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ad-images')
        .upload(`uploads/${filePath}`, selectedImage);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload image');
      }

      // Get the public URL of the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(`uploads/${filePath}`);

      // Create the ad record without specifying an ID
      const { data: newAd, error: createError } = await supabase
        .from('generated_ads')
        .insert({
          name: adData.name,
          headline: adData.headline,
          cta_text: adData.cta_text,
          font_url: adData.font_url,
          platform: adData.platform,
          template_style: adData.template_style,
          width,
          height,
          image_url: publicUrl,
          status: 'pending'
        })
        .select()
        .single();

      if (createError) {
        console.error('Create error:', createError);
        throw new Error('Failed to create ad record');
      }

      // Call the edge function to generate the styled ad
      const { error: generateError } = await supabase.functions.invoke('generate-ad', {
        body: { id: newAd.id }
      });

      if (generateError) {
        console.error('Generate error:', generateError);
        throw new Error('Failed to generate ad');
      }

      toast.success('המודעה נוצרה בהצלחה ותהיה מוכנה בקרוב');
      onAdGenerated(newAd);
      
    } catch (error) {
      console.error('Error creating ad:', error);
      toast.error(error.message || 'אירעה שגיאה ביצירת המודעה');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="name">שם המודעה</Label>
        <Input
          id="name"
          name="name"
          value={adData.name}
          onChange={handleInputChange}
          placeholder="הזן שם למודעה"
          className="text-right"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">תמונה</Label>
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="text-right"
          required
        />
      </div>

      <PlatformSelector
        value={adData.platform}
        onChange={handlePlatformChange}
      />

      <TemplateStyleSelector
        value={adData.template_style}
        onChange={handleStyleChange}
      />

      <div className="space-y-2">
        <Label htmlFor="headline">כותרת</Label>
        <Input
          id="headline"
          name="headline"
          value={adData.headline}
          onChange={handleInputChange}
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
          onChange={handleInputChange}
          placeholder="הזן טקסט לכפתור"
          className="text-right"
          required
        />
      </div>

      <FontSelector value={adData.font_url} onChange={handleFontChange} />

      <Button type="submit" className="w-full" disabled={isGenerating}>
        {isGenerating ? 'יוצר מודעה...' : 'צור מודעה'}
      </Button>
    </form>
  );
};

export default AdEditor;