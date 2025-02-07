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
    const imageData = formData.get('image');
    const dataString = formData.get('data');
    
    if (!imageData || !dataString) {
      throw new Error('Missing required fields');
    }

    const data = JSON.parse(dataString);
    console.log(`[${uploadId}] Parsed data:`, data);

    // Convert FormData image to ArrayBuffer
    let imageArrayBuffer: ArrayBuffer;
    if (imageData instanceof File || imageData instanceof Blob) {
      imageArrayBuffer = await imageData.arrayBuffer();
    } else {
      throw new Error('Invalid image data');
    }

    // Create canvas with the specified dimensions
    const canvas = createCanvas(data.width, data.height);
    const ctx = canvas.getContext('2d');

    // Load and draw the background image
    const backgroundImage = await loadImage(imageArrayBuffer);
    ctx.drawImage(backgroundImage, 0, 0, data.width, data.height);

    // Add overlay
    ctx.fillStyle = data.overlay_color;
    ctx.globalAlpha = data.overlayOpacity;
    ctx.fillRect(0, 0, data.width, data.height);
    ctx.globalAlpha = 1;

    // Configure text settings
    ctx.fillStyle = data.text_color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw headline
    const fontSize = Math.floor(data.width * 0.06);
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillText(data.headline, data.width / 2, data.height * 0.4, data.width * 0.8);

    // Draw description
    if (data.description) {
      const descFontSize = Math.floor(fontSize * 0.7);
      ctx.font = `${descFontSize}px Arial`;
      ctx.fillStyle = data.description_color;
      ctx.fillText(data.description, data.width / 2, data.height * 0.5, data.width * 0.8);
    }

    // Draw CTA button
    if (data.cta_text) {
      const buttonWidth = Math.min(data.width * 0.4, 200);
      const buttonHeight = Math.floor(fontSize * 1.5);
      const buttonX = (data.width - buttonWidth) / 2;
      const buttonY = data.height * 0.7;

      // Draw button background
      ctx.fillStyle = data.cta_color;
      ctx.beginPath();
      // Create rounded rectangle manually since roundRect isn't universally supported
      const radius = buttonHeight / 2;
      ctx.moveTo(buttonX + radius, buttonY);
      ctx.lineTo(buttonX + buttonWidth - radius, buttonY);
      ctx.arc(buttonX + buttonWidth - radius, buttonY + radius, radius, -Math.PI/2, Math.PI/2);
      ctx.lineTo(buttonX + radius, buttonY + buttonHeight);
      ctx.arc(buttonX + radius, buttonY + radius, radius, Math.PI/2, -Math.PI/2);
      ctx.closePath();
      ctx.fill();

      // Draw button text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.floor(fontSize * 0.6)}px Arial`;
      ctx.fillText(data.cta_text, data.width / 2, buttonY + buttonHeight / 2, buttonWidth * 0.9);
    }

    // Convert canvas to buffer and upload
    const imageBuffer = canvas.toBuffer();
    const timestamp = Date.now();
    const filePath = `generated/${uploadId}_${timestamp}_preview.png`;

    // Upload to Supabase Storage
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
      throw new Error(`Failed to upload generated image: ${uploadError.message}`);
    }

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