
import { useState, useCallback } from "react";

export const useAdForm = () => {
  const [adData, setAdData] = useState({
    name: "",
    headline: "",
    description: "",
    cta_text: "",
    font_url: "",
    platform: "instagram-story",
    template_style: "modern", // Set default value here
    accent_color: "#4A90E2",
    cta_color: "#4A90E2",
    overlay_color: "#000000",
    text_color: "#FFFFFF",
    description_color: "#333333"
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFontChange = useCallback((value: string) => {
    setAdData(prev => ({ ...prev, font_url: value }));
  }, []);

  const handlePlatformChange = useCallback((value: string) => {
    setAdData(prev => ({ ...prev, platform: value }));
  }, []);

  const handleStyleChange = useCallback((value: string) => {
    // Guard against invalid values
    if (!value || value.trim() === "") return;
    
    // Use requestAnimationFrame to update state asynchronously
    // This prevents UI blocking and allows other interactions to continue
    requestAnimationFrame(() => {
      setAdData(prev => {
        const newValue = value.trim() || "modern";
        // Only update if the value actually changed
        if (prev.template_style === newValue) return prev;
        return { ...prev, template_style: newValue };
      });
      
      // Force any trapped focus or event handlers to release
      setTimeout(() => {
        // Restore normal interaction state by clearing any trapped focus
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }, 10);
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
