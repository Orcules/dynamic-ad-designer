
import { useState, useCallback } from "react";

export const useAdForm = () => {
  const [adData, setAdData] = useState({
    name: "",
    headline: "",
    description: "",
    cta_text: "",
    font_url: "",
    platform: "instagram-story",
    template_style: "modern",
    accent_color: "#4A90E2",
    cta_color: "#4A90E2",
    overlay_color: "#000000",
    text_color: "#FFFFFF",
    description_color: "#333333"
  });
  
  const [isUpdating, setIsUpdating] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFontChange = useCallback((value: string) => {
    setAdData(prev => ({ ...prev, font_url: value }));
  }, []);

  const handlePlatformChange = useCallback((value: string) => {
    if (isUpdating) return;
    if (value === adData.platform) return;
    
    setIsUpdating(true);
    
    // Use requestAnimationFrame for smoother UI updates
    requestAnimationFrame(() => {
      setAdData(prev => ({ ...prev, platform: value }));
      
      // Add a delay before allowing new updates
      setTimeout(() => {
        setIsUpdating(false);
      }, 100);
    });
  }, [isUpdating, adData.platform]);

  const handleStyleChange = useCallback((value: string) => {
    if (!value || value.trim() === "") return;
    if (isUpdating) return;
    if (value === adData.template_style) return;
    
    setIsUpdating(true);
    
    // Use requestAnimationFrame for smoother UI updates
    requestAnimationFrame(() => {
      setAdData(prev => ({
        ...prev,
        template_style: value.trim()
      }));
      
      // Add a delay before allowing new updates
      setTimeout(() => {
        setIsUpdating(false);
      }, 100);
    });
  }, [isUpdating, adData.template_style]);

  const handleColorChange = useCallback((value: string) => {
    setAdData(prev => ({ ...prev, accent_color: value }));
  }, []);

  const handleCtaColorChange = useCallback((value: string) => {
    setAdData(prev => ({ ...prev, cta_color: value }));
  }, []);

  const handleOverlayColorChange = useCallback((value: string) => {
    setAdData(prev => ({ ...prev, overlay_color: value }));
  }, []);

  const handleTextColorChange = useCallback((value: string) => {
    setAdData(prev => ({ ...prev, text_color: value }));
  }, []);

  const handleDescriptionColorChange = useCallback((value: string) => {
    setAdData(prev => ({ ...prev, description_color: value }));
  }, []);

  return {
    adData,
    isUpdating,
    handleInputChange,
    handleFontChange,
    handlePlatformChange,
    handleStyleChange,
    handleColorChange,
    handleCtaColorChange,
    handleOverlayColorChange,
    handleTextColorChange,
    handleDescriptionColorChange
  };
};
