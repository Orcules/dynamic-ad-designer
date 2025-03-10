
import { useState, useCallback, useRef } from "react";

export const useAdForm = () => {
  // Store previous values for reference
  const prevPlatformRef = useRef("");
  const prevTemplateStyleRef = useRef("");
  
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
  
  // Ensure all callbacks are defined after state
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFontChange = useCallback((value: string) => {
    setAdData(prev => ({ ...prev, font_url: value }));
  }, []);

  const handlePlatformChange = useCallback((value: string) => {
    if (value === adData.platform) return;
    
    // Update the ref first
    prevPlatformRef.current = adData.platform;
    
    // Use a more reliable approach with a slightly longer delay
    setTimeout(() => {
      setAdData(prev => ({ ...prev, platform: value }));
    }, 50);
  }, [adData.platform]);

  const handleStyleChange = useCallback((value: string) => {
    if (!value || value.trim() === "") return;
    if (value === adData.template_style) return;
    
    // Update the ref first
    prevTemplateStyleRef.current = adData.template_style;
    
    // Use a more reliable approach with a slightly longer delay
    setTimeout(() => {
      setAdData(prev => ({
        ...prev,
        template_style: value.trim()
      }));
    }, 50);
  }, [adData.template_style]);

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
