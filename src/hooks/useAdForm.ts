
import { useState, useCallback, useRef, useEffect } from "react";

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
  
  // Refs to store previous values for platform and template style
  const prevPlatformRef = useRef(adData.platform);
  const prevTemplateStyleRef = useRef(adData.template_style);
  
  // Track whether a reset is in progress
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Effect to handle UI updates after platform or template changes
  useEffect(() => {
    if (prevPlatformRef.current !== adData.platform || 
        prevTemplateStyleRef.current !== adData.template_style) {
      // Update refs
      prevPlatformRef.current = adData.platform;
      prevTemplateStyleRef.current = adData.template_style;
      
      // Use a minimal timeout to ensure UI responsiveness
      const timeoutId = setTimeout(() => {
        document.body.style.pointerEvents = 'auto';
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [adData.platform, adData.template_style]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFontChange = useCallback((value: string) => {
    setAdData(prev => ({ ...prev, font_url: value }));
  }, []);

  const handlePlatformChange = useCallback((value: string) => {
    if (value === adData.platform) return;
    
    // Briefly disable pointer events to prevent UI interactions during refresh
    document.body.style.pointerEvents = 'none';
    
    // Update the platform value
    setAdData(prev => ({ ...prev, platform: value }));
  }, [adData.platform]);

  const handleStyleChange = useCallback((value: string) => {
    if (!value || value.trim() === "") return;
    if (value === adData.template_style) return;
    
    // Briefly disable pointer events to prevent UI interactions during refresh
    document.body.style.pointerEvents = 'none';
    
    // Update the template style
    setAdData(prev => ({
      ...prev,
      template_style: value.trim()
    }));
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
