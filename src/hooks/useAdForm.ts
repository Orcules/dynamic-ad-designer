
import { useState, useCallback, useRef } from "react";

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
  
  const isUpdating = useRef(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFontChange = useCallback((value: string) => {
    setAdData(prev => ({ ...prev, font_url: value }));
  }, []);

  const handlePlatformChange = useCallback((value: string) => {
    if (isUpdating.current) return;
    
    isUpdating.current = true;
    requestAnimationFrame(() => {
      setAdData(prev => ({ ...prev, platform: value }));
      isUpdating.current = false;
    });
  }, []);

  const handleStyleChange = useCallback((value: string) => {
    if (!value || value.trim() === "") return;
    if (isUpdating.current) return;
    
    isUpdating.current = true;
    
    // Use requestAnimationFrame for smoother UI updates
    requestAnimationFrame(() => {
      setAdData(prev => {
        const newValue = value.trim();
        if (prev.template_style === newValue) {
          isUpdating.current = false;
          return prev;
        }
        return { ...prev, template_style: newValue };
      });
      
      isUpdating.current = false;
    });
  }, []);

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
