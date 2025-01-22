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
    name: "מודרני ונקי",
    colors: {
      primary: "#8B5CF6",
      secondary: "#D946EF",
      accent: "#FFFFFF",
      background: "linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)"
    }
  },
  {
    id: "bold",
    name: "נועז ותוסס",
    colors: {
      primary: "#F97316",
      secondary: "#FEC6A1",
      accent: "#FFFFFF",
      background: "linear-gradient(225deg, #FFE29F 0%, #FFA99F 48%, #FF719A 100%)"
    }
  },
  {
    id: "soft",
    name: "רך ופסטלי",
    colors: {
      primary: "#D3E4FD",
      secondary: "#FDE1D3",
      accent: "#6E59A5",
      background: "linear-gradient(109.6deg, rgba(223,234,247,1) 11.2%, rgba(244,248,252,1) 91.1%)"
    }
  },
  {
    id: "dark",
    name: "כהה ומסתורי",
    colors: {
      primary: "#9b87f5",
      secondary: "#7E69AB",
      accent: "#FFFFFF",
      background: "linear-gradient(to right, #243949 0%, #517fa4 100%)"
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
      
      const currentStyle = templateStyles.find(style => style.id === selectedStyle) || templateStyles[0];
      
      const data = {
        Name: `${template.title}-${Date.now()}`,
        W: parseInt(template.dimensions.split('x')[0]),
        H: parseInt(template.dimensions.split('x')[1]),
        TR: 'Yes',
        'TR-Text': headline,
        'TR-Font': selectedFont || 'https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&display=swap',
        'TR-Font Size': 48,
        'TR-Color': 'transparent',
        'TR-Text Color': currentStyle.colors.accent,
        'TR-H': 120,
        BT: 'Yes',
        'BT-Text': ctaText,
        'BT-Font': selectedFont || 'https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&display=swap',
        'BT-Font Size': 32,
        'BT-Color': currentStyle.colors.primary,
        'BT-Text Color': currentStyle.colors.accent,
        'BT-H': 100,
        'Button': 'Yes',
        'Button Size': '90%',
        'Background': currentStyle.colors.background
      };

      formData.append('data', JSON.stringify(data));

      const { data: functionData, error } = await supabase.functions.invoke('generate-ad', {
        body: formData
      });

      if (error) throw error;

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
          <Label htmlFor="style">סגנון עיצוב</Label>
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
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cta">טקסט CTA</Label>
          <Input
            id="cta"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            placeholder="הכנס טקסט CTA"
            className="text-lg"
          />
        </div>

        <div
          className="border-2 border-dashed rounded-lg p-8 text-center space-y-4 cursor-pointer hover:border-primary transition-colors"
          style={{
            background: typeof currentStyle.colors.background === 'string' ? currentStyle.colors.background : 'transparent',
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
          className="w-full text-lg py-6 hover:scale-105 transition-transform"
          style={{
            background: currentStyle.colors.primary,
            color: currentStyle.colors.accent,
          }}
          onClick={handleGenerateAds}
        >
          צור מודעה
        </Button>
      </div>
    </div>
  );
}