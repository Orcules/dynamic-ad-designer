import { toast } from "sonner";
import { getDimensions } from "./adDimensions";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from 'html2canvas';
import { applyImageEffect } from "./imageEffects";

interface Position {
  x: number;
  y: number;
}

interface AdPositions {
  headlinePosition: Position;
  descriptionPosition: Position;
  ctaPosition: Position;
  imagePosition: Position;
}

export const processImages = async (
  adData: any,
  images: (File | string)[],
  previewRef: React.RefObject<HTMLDivElement>,
  onAdGenerated: (adData: any) => void,
  handleSubmission: any,
  setIsGenerating: (value: boolean) => void,
  positions: AdPositions
) => {
  console.log("Starting to process images:", images.length);
  console.log("Using positions:", positions);
  let successCount = 0;
  
  for (let i = 0; i < images.length; i++) {
    const currentImage = images[i];
    console.log(`Processing image ${i + 1}/${images.length}`);

    try {
      if (!previewRef.current) {
        throw new Error('Preview element not found');
      }

      // הוספת מחלקה זמנית לטקסט של ה-CTA לפני הקפיטורינג
      const ctaText = previewRef.current.querySelector('.ad-content button span span');
      if (ctaText) {
        ctaText.classList.add('translate-y-[-8px]');
      }

      // קפיטורינג של התצוגה המקדימה
      const canvas = await html2canvas(previewRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2,
        logging: true,
      });

      // הסרת המחלקה הזמנית אחרי הקפיטורינג
      if (ctaText) {
        ctaText.classList.remove('translate-y-[-8px]');
      }

      // אפקט על התמונה אם יש
      const finalImageUrl = await applyImageEffect(canvas, adData.effect || 'none');
      
      // המרה של התצוגה המקדימה ל-blob
      const response = await fetch(finalImageUrl);
      const previewBlob = await response.blob();

      // העלאת התצוגה המקדימה
      const previewPath = `previews/${crypto.randomUUID()}.jpg`;
      const { error: previewUploadError } = await supabase.storage
        .from('ad-images')
        .upload(previewPath, previewBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (previewUploadError) {
        throw new Error(`Failed to upload preview: ${previewUploadError.message}`);
      }

      const { data: { publicUrl: previewUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(previewPath);

      // טיפול בתמונה המקורית
      let imageUrl: string;
      let imageBlob: Blob;
      
      if (typeof currentImage === 'string') {
        const response = await fetch(currentImage);
        if (!response.ok) {
          throw new Error(`Failed to access image URL: ${currentImage}`);
        }
        imageBlob = await response.blob();
        imageUrl = currentImage;
      } else {
        imageBlob = currentImage;
        imageUrl = await handleSubmission(currentImage);
      }

      if (!imageUrl) {
        throw new Error('No image URL generated');
      }

      const { width, height } = getDimensions(adData.platform);

      // העשרת הנתונים עם המיקומים העדכניים
      const enrichedData = {
        ...adData,
        width,
        height,
        headlinePosition: {
          x: positions.headlinePosition.x || 0,
          y: positions.headlinePosition.y || 0
        },
        descriptionPosition: {
          x: positions.descriptionPosition.x || 0,
          y: positions.descriptionPosition.y || 0
        },
        ctaPosition: {
          x: positions.ctaPosition.x || 0,
          y: positions.ctaPosition.y || 0
        },
        imagePosition: {
          x: positions.imagePosition.x || 0,
          y: positions.imagePosition.y || 0
        },
        showArrow: true // הוספנו אינדיקציה מפורשת להצגת החץ
      };

      // הכנת הנתונים לשליחה
      const formData = new FormData();
      formData.append('image', imageBlob);
      formData.append('data', JSON.stringify(enrichedData));

      console.log("Sending data to edge function:", enrichedData);

      // שליחה לפונקציית Edge
      const { data: generatedData, error: generateError } = await supabase.functions
        .invoke('generate-ad', {
          body: formData
        });

      if (generateError) {
        throw generateError;
      }

      if (!generatedData?.imageUrl) {
        throw new Error('No generated image URL received');
      }

      // שמירת המודעה שנוצרה
      const enrichedAdData = {
        name: `${adData.headline || 'Untitled'} - Version ${i + 1}`,
        headline: adData.headline,
        description: adData.description,
        cta_text: adData.cta_text,
        font_url: adData.font_url,
        platform: adData.platform,
        template_style: adData.template_style || 'modern',
        accent_color: adData.accent_color || '#4A90E2',
        cta_color: adData.cta_color || '#4A90E2',
        overlay_color: adData.overlay_color || '#000000',
        text_color: adData.text_color || '#FFFFFF',
        description_color: adData.description_color || '#333333',
        image_url: imageUrl,
        preview_url: previewUrl,
        effect: adData.effect || 'none',
        width,
        height,
        status: 'completed',
        headline_position_x: positions.headlinePosition.x,
        headline_position_y: positions.headlinePosition.y,
        description_position_x: positions.descriptionPosition.x,
        description_position_y: positions.descriptionPosition.y,
        cta_position_x: positions.ctaPosition.x,
        cta_position_y: positions.ctaPosition.y,
        image_position_x: positions.imagePosition.x,
        image_position_y: positions.imagePosition.y,
        show_arrow: true
      };

      const { data: insertedAd, error: insertError } = await supabase
        .from('generated_ads')
        .insert([enrichedAdData])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      if (insertedAd) {
        successCount++;
        onAdGenerated(insertedAd);
        console.log(`Successfully inserted ad ${i + 1}`);
      }

    } catch (error) {
      console.error(`Error processing image ${i + 1}:`, error);
      toast.error(`Failed to process image ${i + 1}: ${error.message}`);
    }
  }
  
  if (successCount > 0) {
    toast.success(`Successfully created ${successCount} ads!`);
  } else {
    toast.error('No ads were created. Please check the errors and try again.');
  }
};
