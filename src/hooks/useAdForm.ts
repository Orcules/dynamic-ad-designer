import { useState, useCallback } from "react";

interface Position {
  x: number;
  y: number;
}

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
    description_color: "#FFFFFF"
  });
  
  const [imagePosition, setImagePosition] = useState<Position>({ x: 0, y: 0 });
  const [headlinePosition, setHeadlinePosition] = useState<Position>({ x: 0, y: 0 });
  const [descriptionPosition, setDescriptionPosition] = useState<Position>({ x: 0, y: 0 });
  const [ctaPosition, setCtaPosition] = useState<Position>({ x: 0, y: 0 });
  const [overlayOpacity, setOverlayOpacity] = useState(0.4);
  
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
    setAdData(prev => ({ ...prev, template_style: value }));
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
  
  const handleOpacityChange = useCallback((value: number) => {
    setOverlayOpacity(value);
  }, []);
  
  const handleImagePositionChange = useCallback((position: Position) => {
    setImagePosition(position);
  }, []);
  
  const handleHeadlinePositionChange = useCallback((position: Position) => {
    setHeadlinePosition(position);
  }, []);
  
  const handleDescriptionPositionChange = useCallback((position: Position) => {
    setDescriptionPosition(position);
  }, []);
  
  const handleCtaPositionChange = useCallback((position: Position) => {
    setCtaPosition(position);
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
    handleOpacityChange,
    handleImagePositionChange,
    handleHeadlinePositionChange,
    handleDescriptionPositionChange,
    handleCtaPositionChange
  };
};
