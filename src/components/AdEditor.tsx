import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdForm } from "./AdForm";
import { AdPreview } from "./AdPreview";
import html2canvas from "html2canvas";

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
  const previewRef = useRef<HTMLDivElement>(null);

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

  const capturePreview = async () => {
    if (!previewRef.current) return null;
    
    const adContentElement = previewRef.current.querySelector('.ad-content');
    if (!adContentElement) return null;
    
    try {
      // Wait for fonts to load before capturing
      await document.fonts.ready;
      
      // Create a clone of the element for capturing
      const clone = adContentElement.cloneNode(true) as HTMLElement;
      const container = document.createElement('div');
      container.appendChild(clone);
      document.body.appendChild(container);
      
      // Apply capture-specific styles
      clone.style.transform = 'none';
      clone.style.transition = 'none';
      clone.style.animation = 'none';
      
      // Set explicit dimensions
      const { width, height } = getDimensions(adData.platform);
      clone.style.width = `${width}px`;
      clone.style.height = `${height}px`;
      
      // Capture with higher quality settings
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: true,
        width: width,
        height: height,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.ad-content');
          if (clonedElement) {
            (clonedElement as HTMLElement).style.position = 'static';
            (clonedElement as HTMLElement).style.transform = 'none';
          }
        }
      });
      
      // Clean up
      document.body.removeChild(container);
      
      return new Promise<File>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `${adData.name || 'ad'}.png`, { type: 'image/png' });
            resolve(file);
          }
        }, 'image/png', 1.0);
      });
    } catch (error) {
      console.error('Error capturing preview:', error);
      return null;
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
      
      // Upload the background image
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

      // Capture and upload the preview
      const previewFile = await capturePreview();
      if (!previewFile) {
        throw new Error('Failed to capture preview');
      }

      const previewPath = `generated/${timestamp}_preview.png`;
      const { data: previewData, error: previewError } = await supabase.storage
        .from('ad-images')
        .upload(previewPath, previewFile);

      if (previewError) {
        console.error('Preview upload error:', previewError);
        throw new Error('Failed to upload preview');
      }

      const { data: { publicUrl: previewUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(previewPath);

      // Create the ad record
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
          image_url: previewUrl,
          status: 'completed'
        })
        .select()
        .single();

      if (createError) {
        console.error('Create error:', createError);
        throw new Error('Failed to create ad record');
      }

      toast.success('המודעה נוצרה בהצלחה!', {
        action: {
          label: 'הורד',
          onClick: () => window.open(previewUrl, '_blank')
        },
      });
      
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

      <div className="sticky top-8" ref={previewRef}>
        <AdPreview
          imageUrl={previewUrl || undefined}
          width={width}
          height={height}
          headline={adData.headline}
          ctaText={adData.cta_text}
          templateStyle={adData.template_style}
          accentColor={adData.accent_color}
          fontUrl={adData.font_url}
        />
      </div>
    </div>
  );
};

export default AdEditor;