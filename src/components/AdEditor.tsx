import React, { useState } from "react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdForm } from "./AdForm";
import { AdPreview } from "./AdPreview";

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
    accent_color: "#4A90E2",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
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

  const handleColorChange = (value: string) => {
    setAdData((prev) => ({
      ...prev,
      accent_color: value,
    }));
  };

  const getDimensions = (platform: string) => {
    switch (platform) {
      case "facebook":
        return { width: 1200, height: 628 };
      case "instagram":
        return { width: 1080, height: 1080 };
      case "linkedin":
        return { width: 1200, height: 627 };
      case "twitter":
        return { width: 1600, height: 900 };
      default:
        return { width: 1200, height: 628 };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage) {
      toast.error('נא לבחור תמונה');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const { width, height } = getDimensions(adData.platform);
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

      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(`uploads/${filePath}`);

      const { data: newAd, error: createError } = await supabase
        .from('generated_ads')
        .insert({
          name: adData.name,
          headline: adData.headline,
          cta_text: adData.cta_text,
          font_url: adData.font_url,
          platform: adData.platform,
          template_style: adData.template_style,
          accent_color: adData.accent_color,
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

  const { width, height } = getDimensions(adData.platform);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-card p-6 rounded-lg">
        <AdForm
          adData={adData}
          onInputChange={handleInputChange}
          onFontChange={handleFontChange}
          onPlatformChange={handlePlatformChange}
          onStyleChange={handleStyleChange}
          onColorChange={handleColorChange}
          onImageChange={handleImageChange}
        />
        <Button type="submit" className="w-full mt-6" disabled={isGenerating} onClick={handleSubmit}>
          {isGenerating ? 'יוצר מודעה...' : 'צור מודעה'}
        </Button>
      </div>

      <div className="sticky top-8">
        <AdPreview
          imageUrl={previewUrl || undefined}
          width={width}
          height={height}
          headline={adData.headline}
          ctaText={adData.cta_text}
          templateStyle={adData.template_style}
          accentColor={adData.accent_color}
        />
      </div>
    </div>
  );
};

export default AdEditor;