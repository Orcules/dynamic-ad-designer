import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload } from "lucide-react";
import { FontSelector } from "./FontSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface AdEditorProps {
  template: {
    title: string;
    dimensions: string;
  };
  onAdGenerated?: (adData: any) => void;
}

const templateStyles = [
  {
    id: "modern",
    name: "Modern & Clean",
    colors: {
      primary: "#9b87f5",
      secondary: "#8E9196",
      accent: "#0FA0CE",
      background: "#FFFFFF"
    }
  },
  {
    id: "bold",
    name: "Bold & Vibrant",
    colors: {
      primary: "#F97316",
      secondary: "#D946EF",
      accent: "#0EA5E9",
      background: "#1A1F2C"
    }
  },
  {
    id: "soft",
    name: "Soft & Pastel",
    colors: {
      primary: "#F2FCE2",
      secondary: "#FEF7CD",
      accent: "#FEC6A1",
      background: "#E5DEFF"
    }
  },
  {
    id: "dark",
    name: "Dark & Moody",
    colors: {
      primary: "#221F26",
      secondary: "#403E43",
      accent: "#FFFFFF",
      background: "#8A898C"
    }
  }
];

export function AdEditor({ template, onAdGenerated }: AdEditorProps) {
  const [headline, setHeadline] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [selectedFont, setSelectedFont] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(templateStyles[0].id);
  const { toast } = useToast();

  const handleGenerateAds = async () => {
    try {
      const formData = new FormData();
      if (image) {
        formData.append('image', image);
      }
      
      const data = {
        Name: `${template.title}-${Date.now()}`,
        W: parseInt(template.dimensions.split('x')[0]),
        H: parseInt(template.dimensions.split('x')[1]),
        TR: 'Yes',
        'TR-Text': headline,
        'TR-Font': selectedFont || 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2',
        'TR-Font Size': 32,
        'TR-Color': currentStyle.colors.primary,
        'TR-Text Color': currentStyle.colors.accent,
        'TR-H': 100,
        BT: 'Yes',
        'BT-Text': ctaText,
        'BT-Font': selectedFont || 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2',
        'BT-Font Size': 24,
        'BT-Color': currentStyle.colors.secondary,
        'BT-Text Color': currentStyle.colors.background,
        'BT-H': 80,
        'Button': 'Yes',
        'Button Size': '80%'
      };

      formData.append('data', JSON.stringify(data));

      const { data: functionData, error } = await supabase.functions.invoke('generate-ad', {
        body: formData
      });

      if (error) throw error;

      // Call the onAdGenerated callback with the preview data
      onAdGenerated?.({
        image_url: functionData?.image_url,
        headline: headline,
        cta_text: ctaText
      });

      toast({
        title: "המודעה נוצרה בהצלחה!",
        description: (
          <div className="rtl">
            <p>המודעה נוצרה בהצלחה ותוכל למצוא אותה בטבלת המודעות למטה.</p>
            <p>לחץ על השורה בטבלה כדי לצפות במודעה המלאה.</p>
          </div>
        ),
        duration: 5000,
      });
      
    } catch (error) {
      console.error('Error generating ad:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת המודעה. אנא נסה שנית.",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
    } else {
      toast({
        title: "סוג קובץ לא תקין",
        description: "אנא העלה קובץ תמונה בלבד",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const currentStyle = templateStyles.find(style => style.id === selectedStyle) || templateStyles[0];

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{template.title}</h2>
        <p className="text-muted-foreground">{template.dimensions}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="style">סגנון תבנית</Label>
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger>
              <SelectValue placeholder="בחר סגנון" />
            </SelectTrigger>
            <SelectContent>
              {templateStyles.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  {style.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <FontSelector value={selectedFont} onChange={setSelectedFont} />

        <div className="space-y-2">
          <Label htmlFor="headline">כותרת</Label>
          <Input
            id="headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="הכנס את הכותרת שלך"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cta">טקסט CTA</Label>
          <Input
            id="cta"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            placeholder="הכנס טקסט CTA"
          />
        </div>

        <div
          className="border-2 border-dashed rounded-lg p-8 text-center space-y-4 cursor-pointer hover:border-primary transition-colors"
          style={{
            backgroundColor: currentStyle.colors.background,
            borderColor: currentStyle.colors.accent,
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">
              גרור ושחרר את התמונה שלך כאן, או לחץ כדי לבחור
            </p>
            {image && <p className="text-sm text-primary mt-2">{image.name}</p>}
          </div>
        </div>

        <Button 
          className="w-full"
          style={{
            backgroundColor: currentStyle.colors.primary,
            color: currentStyle.colors.background,
          }}
          onClick={handleGenerateAds}
        >
          צור מודעות
        </Button>
      </div>
    </div>
  );
}