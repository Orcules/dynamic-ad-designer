import { useState, useCallback, useEffect, useRef } from "react";
import { templateColorSchemes } from "@/components/TemplateStyleSelector";

interface Position {
  x: number;
  y: number;
}

export const useAdForm = () => {
  const initialStyleApplied = useRef<boolean>(false);
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
    description_color: "#FFFFFF"
  });
  
  const [imagePosition, setImagePosition] = useState<Position>({ x: 0, y: 0 });
  const [headlinePosition, setHeadlinePosition] = useState<Position>({ x: 0, y: 0 });
  const [descriptionPosition, setDescriptionPosition] = useState<Position>({ x: 0, y: 0 });
  const [ctaPosition, setCtaPosition] = useState<Position>({ x: 0, y: 0 });
  const [overlayOpacity, setOverlayOpacity] = useState(0.4);
  
  // Apply default color scheme when the component mounts
  useEffect(() => {
    if (!initialStyleApplied.current) {
      if (adData.template_style && templateColorSchemes[adData.template_style]) {
        const scheme = templateColorSchemes[adData.template_style];
        setAdData(prev => ({
          ...prev,
          text_color: scheme.textColor,
          description_color: scheme.descriptionColor,
          overlay_color: scheme.overlayColor,
          cta_color: scheme.ctaColor
        }));
        setOverlayOpacity(scheme.overlayOpacity);
        initialStyleApplied.current = true;
      }
    }
  }, []); // Only run once on mount
  
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
    const startTime = performance.now();
    
    // Apply the color scheme for the selected template
    if (templateColorSchemes[value]) {
      const scheme = templateColorSchemes[value];
      // Use a single state update for better performance
      setAdData(prev => ({
        ...prev,
        template_style: value,
        text_color: scheme.textColor,
        description_color: scheme.descriptionColor,
        overlay_color: scheme.overlayColor,
        cta_color: scheme.ctaColor
      }));
      setOverlayOpacity(scheme.overlayOpacity);
      console.log(`Applied template style ${value} in ${performance.now() - startTime}ms`);
    } else {
      setAdData(prev => ({ ...prev, template_style: value }));
    }
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
    imagePosition,
    headlinePosition,
    descriptionPosition,
    ctaPosition,
    overlayOpacity,
    handleInputChange,
    handleFontChange,
    handlePlatformChange,
    handleStyleChange,
    handleColorChange,
    handleCtaColorChange,
    handleOverlayColorChange,
    handleTextColorChange,
    handleDescriptionColorChange,
    handleOpacityChange: setOverlayOpacity,
    handleImagePositionChange: setImagePosition,
    handleHeadlinePositionChange: setHeadlinePosition,
    handleDescriptionPositionChange: setDescriptionPosition,
    handleCtaPositionChange: setCtaPosition
  };
};
