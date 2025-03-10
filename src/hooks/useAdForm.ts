
import { useState, useCallback, useRef } from "react";

export const useAdForm = () => {
  // Store previous values for reference
  const prevPlatformRef = useRef("");
  const prevTemplateStyleRef = useRef("");
  // Use a ref to track if we're currently processing a change
  const isProcessingRef = useRef(false);
  
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
  
  // Safe state updater that prevents conflicts
  const safeUpdateState = useCallback((updateFn: (prev: typeof adData) => typeof adData) => {
    if (isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    requestAnimationFrame(() => {
      setAdData(updateFn);
      isProcessingRef.current = false;
    });
  }, []);
  
  // Ensure all callbacks are defined after state
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFontChange = useCallback((value: string) => {
    setAdData(prev => ({ ...prev, font_url: value }));
  }, []);

  const handlePlatformChange = useCallback((value: string) => {
    if (value === adData.platform || isProcessingRef.current) return;
    
    // Update the ref first
    prevPlatformRef.current = adData.platform;
    
    safeUpdateState(prev => ({ ...prev, platform: value }));
  }, [adData.platform, safeUpdateState]);

  const handleStyleChange = useCallback((value: string) => {
    if (!value || value.trim() === "") return;
    if (value === adData.template_style || isProcessingRef.current) return;
    
    // Update the ref first
    prevTemplateStyleRef.current = adData.template_style;
    
    safeUpdateState(prev => ({
      ...prev,
      template_style: value.trim()
    }));
  }, [adData.template_style, safeUpdateState]);

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
