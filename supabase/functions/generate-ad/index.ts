
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
      console.log(`[${uploadId}] Processing uploaded file`);
    } else if (typeof imageFile === 'string') {
      console.log(`[${uploadId}] Fetching image from URL:`, imageFile);
      const response = await fetch(imageFile);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      imageArrayBuffer = await response.arrayBuffer();
    } else {
      console.error(`[${uploadId}] Invalid image data type:`, typeof imageFile);
      throw new Error('Invalid image data type');
    }

    const canvas = createCanvas(data.width, data.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    console.log(`[${uploadId}] Loading background image... Size:`, imageArrayBuffer.byteLength);
    const backgroundImage = await loadImage(imageArrayBuffer);
    console.log(`[${uploadId}] Background image loaded. Dimensions:`, backgroundImage.width, 'x', backgroundImage.height);
    
    ctx.drawImage(backgroundImage, 0, 0, data.width, data.height);
    console.log(`[${uploadId}] Background image drawn`);

    const overlayOpacity = data.overlayOpacity !== undefined ? data.overlayOpacity : 0.4;
    console.log(`[${uploadId}] Adding overlay with opacity:`, overlayOpacity);
    
    ctx.save();
    ctx.globalAlpha = overlayOpacity;
    ctx.fillStyle = data.overlay_color || 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, data.width, data.height);
    ctx.restore();
    
    console.log(`[${uploadId}] Overlay added`);

    // Configure text settings
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw headline
    if (data.headline) {
      const fontSize = Math.floor(data.width * 0.06);
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = data.text_color || '#FFFFFF';
      console.log(`[${uploadId}] Drawing headline: "${data.headline}" with font size ${fontSize}`);
      ctx.fillText(data.headline, data.width / 2, data.height * 0.4, data.width * 0.8);
    }

    // Draw description
    if (data.description) {
      const descFontSize = Math.floor(data.width * 0.04);
      ctx.font = `${descFontSize}px Arial`;
      ctx.fillStyle = data.description_color || '#FFFFFF';
      console.log(`[${uploadId}] Drawing description: "${data.description}" with font size ${descFontSize}`);
      ctx.fillText(data.description, data.width / 2, data.height * 0.5, data.width * 0.8);
    }

    // Draw CTA button
    if (data.cta_text) {
      const buttonWidth = Math.min(data.width * 0.4, 200);
      const buttonHeight = Math.floor(data.width * 0.06);
      const buttonX = (data.width - buttonWidth) / 2;
      const ctaY = data.height * 0.65; // Adjusted Y position to match preview

      console.log(`[${uploadId}] Drawing CTA button: "${data.cta_text}"`);
      
      // Draw button background
      ctx.fillStyle = data.cta_color || '#4A90E2';
      ctx.beginPath();
      const radius = buttonHeight / 2;
      ctx.moveTo(buttonX + radius, ctaY);
      ctx.lineTo(buttonX + buttonWidth - radius, ctaY);
      ctx.arc(buttonX + buttonWidth - radius, ctaY + radius, radius, -Math.PI/2, Math.PI/2);
      ctx.lineTo(buttonX + radius, ctaY + buttonHeight);
      ctx.arc(buttonX + radius, ctaY + radius, radius, Math.PI/2, -Math.PI/2);
      ctx.closePath();
      ctx.fill();

      // Draw button text
      ctx.fillStyle = '#FFFFFF';
      const ctaFontSize = Math.floor(buttonHeight * 0.6);
      ctx.font = `bold ${ctaFontSize}px Arial`;
      console.log(`[${uploadId}] Drawing CTA text with font size ${ctaFontSize}`);
      ctx.fillText(data.cta_text, data.width / 2, ctaY + buttonHeight / 2, buttonWidth * 0.9);
    }

    // Convert canvas to buffer and upload
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
