
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCanvas, loadImage } from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const uploadId = crypto.randomUUID();
  console.log(`[${uploadId}] Starting ad generation process`);

  try {
    const formData = await req.formData();
    const imageFile = formData.get('image');
    const dataString = formData.get('data');
    
    if (!imageFile || !dataString) {
      throw new Error('Missing required fields');
    }

    const data = JSON.parse(dataString);
    console.log(`[${uploadId}] Parsed data:`, data);

    let imageArrayBuffer: ArrayBuffer;
    
    if (imageFile instanceof File || imageFile instanceof Blob) {
      imageArrayBuffer = await imageFile.arrayBuffer();
      console.log(`[${uploadId}] Processing uploaded file. Type:`, imageFile.type);
    } else if (typeof imageFile === 'string') {
      const response = await fetch(imageFile);
      imageArrayBuffer = await response.arrayBuffer();
      console.log(`[${uploadId}] Processing image from URL`);
    } else {
      console.error(`[${uploadId}] Invalid image data type:`, typeof imageFile);
      throw new Error('Invalid image data type');
    }

    const canvas = createCanvas(data.width, data.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    console.log(`[${uploadId}] Loading background image...`);
    const backgroundImage = await loadImage(imageArrayBuffer);
    console.log(`[${uploadId}] Background image loaded. Dimensions:`, backgroundImage.width, 'x', backgroundImage.height);

    // תיקון עיוות התמונה - שימוש ב-object-fit: cover בצורה פרוגרמטית
    const imageRatio = backgroundImage.width / backgroundImage.height;
    const canvasRatio = data.width / data.height;
    
    let drawWidth = data.width;
    let drawHeight = data.height;
    
    if (imageRatio > canvasRatio) {
      drawWidth = data.height * imageRatio;
      drawHeight = data.height;
    } else {
      drawWidth = data.width;
      drawHeight = data.width / imageRatio;
    }
    
    const x = (data.width - drawWidth) / 2 + (data.imagePosition?.x || 0);
    const y = (data.height - drawHeight) / 2 + (data.imagePosition?.y || 0);
    
    ctx.drawImage(backgroundImage, x, y, drawWidth, drawHeight);
    console.log(`[${uploadId}] Background image drawn with dimensions:`, drawWidth, 'x', drawHeight);

    const overlayOpacity = data.overlayOpacity !== undefined ? data.overlayOpacity : 0.4;
    console.log(`[${uploadId}] Adding overlay with opacity:`, overlayOpacity);
    
    ctx.save();
    ctx.globalAlpha = overlayOpacity;
    ctx.fillStyle = data.overlay_color || 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, data.width, data.height);
    ctx.restore();
    
    console.log(`[${uploadId}] Overlay added`);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // ציור הטקסטים
    if (data.headline) {
      const fontSize = Math.floor(data.width * 0.06);
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = data.text_color || '#FFFFFF';
      const headlineX = data.headlinePosition?.x !== undefined ? data.headlinePosition.x : data.width / 2;
      const baseHeadlineY = data.headlinePosition?.y !== undefined ? data.headlinePosition.y : data.height * 0.4;
      ctx.fillText(data.headline, headlineX, baseHeadlineY - 5, data.width * 0.8);
    }

    if (data.description) {
      const descFontSize = Math.floor(data.width * 0.04);
      ctx.font = `${descFontSize}px Arial`;
      ctx.fillStyle = data.description_color || '#FFFFFF';
      const descX = data.descriptionPosition?.x !== undefined ? data.descriptionPosition.x : data.width / 2;
      const baseDescY = data.descriptionPosition?.y !== undefined ? data.descriptionPosition.y : data.height * 0.5;
      ctx.fillText(data.description, descX, baseDescY - 5, data.width * 0.8);
    }

    // ציור כפתור ה-CTA
    if (data.cta_text) {
      console.log(`[${uploadId}] Drawing CTA button with text:`, data.cta_text);
      console.log(`[${uploadId}] Show arrow:`, data.showArrow);
      
      const buttonWidth = Math.min(data.width * 0.4, 200);
      const buttonHeight = Math.floor(data.width * 0.06);
      const ctaX = data.ctaPosition?.x !== undefined ? data.ctaPosition.x : (data.width - buttonWidth) / 2;
      const ctaY = (data.ctaPosition?.y !== undefined ? data.ctaPosition.y : data.height * 0.65) - 3;
      
      ctx.fillStyle = data.cta_color || '#4A90E2';
      ctx.beginPath();
      const radius = buttonHeight / 2;
      ctx.moveTo(ctaX + radius, ctaY);
      ctx.lineTo(ctaX + buttonWidth - radius, ctaY);
      ctx.arc(ctaX + buttonWidth - radius, ctaY + radius, radius, -Math.PI/2, Math.PI/2);
      ctx.lineTo(ctaX + radius, ctaY + buttonHeight);
      ctx.arc(ctaX + radius, ctaY + radius, radius, Math.PI/2, -Math.PI/2);
      ctx.closePath();
      ctx.fill();

      // מרכוז הטקסט בכפתור
      ctx.fillStyle = '#FFFFFF';
      const ctaFontSize = Math.floor(buttonHeight * 0.6);
      ctx.font = `bold ${ctaFontSize}px Arial`;

      const textWidth = ctx.measureText(data.cta_text).width;
      const arrowHeight = ctaFontSize * 0.5;
      const arrowWidth = ctaFontSize * 0.3;
      const spacing = ctaFontSize * 0.2;
      
      let totalWidth;
      if (data.showArrow !== false) {
        totalWidth = textWidth + arrowWidth + spacing;
      } else {
        totalWidth = textWidth;
      }

      // חישוב מחדש של מיקום הטקסט כדי שיהיה במרכז
      const startX = ctaX + (buttonWidth - totalWidth) / 2;
      ctx.fillText(data.cta_text, startX + textWidth/2, ctaY + buttonHeight/2);

      // ציור החץ רק אם showArrow לא false
      if (data.showArrow !== false) {
        console.log(`[${uploadId}] Drawing arrow`);
        const arrowY = ctaY + buttonHeight/2;
        const arrowX = startX + textWidth + spacing;
        
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF';
        
        ctx.moveTo(arrowX + arrowWidth/2, arrowY - arrowHeight/2);
        ctx.lineTo(arrowX + arrowWidth/2, arrowY + arrowHeight/2);
        ctx.lineTo(arrowX + arrowWidth, arrowY + arrowHeight/4);
        ctx.moveTo(arrowX + arrowWidth/2, arrowY + arrowHeight/2);
        ctx.lineTo(arrowX, arrowY + arrowHeight/4);
        
        ctx.stroke();
      }
    }

    console.log(`[${uploadId}] Converting canvas to buffer...`);
    const imageBuffer = canvas.toBuffer();
    const timestamp = Date.now();
    const filePath = `generated/${timestamp}_ad.png`;

    console.log(`[${uploadId}] Uploading to Supabase Storage...`);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: uploadError } = await supabase.storage
      .from('ad-images')
      .upload(filePath, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error(`[${uploadId}] Upload error:`, uploadError);
      throw new Error(`Failed to upload generated image: ${uploadError.message}`);
    }

    console.log(`[${uploadId}] Upload successful`);

    const { data: { publicUrl: generatedImageUrl } } = supabase.storage
      .from('ad-images')
      .getPublicUrl(filePath);

    console.log(`[${uploadId}] Generated image URL:`, generatedImageUrl);

    return new Response(
      JSON.stringify({
        imageUrl: generatedImageUrl,
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${uploadId}] Error generating ad:`, error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
