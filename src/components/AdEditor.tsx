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
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      // Create the ad record
      const { data: newAd, error: createError } = await supabase
        .from('generated_ads')
        .insert([{
          ...adData,
          width,
          height,
          status: 'pending'
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Call the edge function to generate the image
      const { error: generateError } = await supabase.functions.invoke('generate-ad', {
        body: { id: newAd.id }
      });

      if (generateError) throw generateError;

      toast.success('המודעה נוצרה בהצלחה ותהיה מוכנה בקרוב');
      onAdGenerated(newAd);
      
    } catch (error) {
      console.error('Error creating ad:', error);
      toast.error('אירעה שגיאה ביצירת המודעה');
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