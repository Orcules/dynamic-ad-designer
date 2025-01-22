import React, { useEffect, useState } from "react";

interface AdEditorProps {
  template: {
    id: string;
    title: string;
    dimensions: string;
  };
  onAdGenerated: (adData: any) => void;
}

const AdEditor: React.FC<AdEditorProps> = ({ template, onAdGenerated }) => {
  const [adData, setAdData] = useState<any>(null);

  const templates = {
    classic: {
      name: "קלאסי ואלגנטי",
      colors: {
        primary: "#8B5CF6",
        secondary: "#D946EF",
        accent: "#FFFFFF",
        background: "linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)"
      }
    },
    bold: {
      name: "נועז ותוסס",
      colors: {
        primary: "#F97316",
        secondary: "#FEC6A1",
        accent: "#FFFFFF",
        background: "linear-gradient(225deg, #FFE29F 0%, #FFA99F 48%, #FF719A 100%)"
      }
    },
    minimal: {
      name: "מינימליסטי",
      colors: {
        primary: "#000000",
        secondary: "#404040",
        accent: "#FFFFFF",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
      }
    },
    nature: {
      name: "טבעי ורענן",
      colors: {
        primary: "#059669",
        secondary: "#34D399",
        accent: "#FFFFFF",
        background: "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)"
      }
    }
  };

  useEffect(() => {
    // Simulate ad generation
    const generatedAd = {
      image_url: "https://example.com/ad-preview.png",
      headline: "מודעה לדוגמה",
      cta_text: "למידע נוסף"
    };
    setAdData(generatedAd);
    onAdGenerated(generatedAd);
  }, [template, onAdGenerated]);

  return (
    <div
      className="ad-editor"
      style={{
        background: templates[template.id]?.colors.background,
        color: templates[template.id]?.colors.accent,
        padding: "20px",
        borderRadius: "8px"
      }}
    >
      <h2>{templates[template.id]?.name}</h2>
      {adData && (
        <div>
          <img src={adData.image_url} alt="Ad preview" />
          <h3>{adData.headline}</h3>
          <button style={{ backgroundColor: templates[template.id]?.colors.primary }}>
            {adData.cta_text}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdEditor;