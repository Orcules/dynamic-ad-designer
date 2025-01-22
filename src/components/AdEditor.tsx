import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FontSelector } from "./FontSelector";

interface AdEditorProps {
  template: {
    id: string;
    title: string;
    dimensions: string;
  };
  onAdGenerated: (adData: any) => void;
}

const AdEditor: React.FC<AdEditorProps> = ({ template, onAdGenerated }) => {
  const [adData, setAdData] = useState({
    name: "",
    headline: "",
    cta_text: "",
    font_url: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFontChange = (value: string) => {
    setAdData((prev) => ({
      ...prev,
      font_url: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdGenerated({
      ...adData,
      width: parseInt(template.dimensions.split(" x ")[0]),
      height: parseInt(template.dimensions.split(" x ")[1]),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="name">שם המודעה</Label>
        <Input
          id="name"
          name="name"
          value={adData.name}
          onChange={handleInputChange}
          placeholder="הזן שם למודעה"
          className="text-right"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="headline">כותרת</Label>
        <Input
          id="headline"
          name="headline"
          value={adData.headline}
          onChange={handleInputChange}
          placeholder="הזן כותרת למודעה"
          className="text-right"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cta_text">טקסט CTA</Label>
        <Input
          id="cta_text"
          name="cta_text"
          value={adData.cta_text}
          onChange={handleInputChange}
          placeholder="הזן טקסט לכפתור"
          className="text-right"
          required
        />
      </div>

      <FontSelector value={adData.font_url} onChange={handleFontChange} />

      <Button type="submit" className="w-full">
        צור מודעה
      </Button>
    </form>
  );
};

export default AdEditor;