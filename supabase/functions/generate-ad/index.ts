import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCanvas, loadImage } from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { StorageManager } from "./storageManager.ts";

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

  const storageManager = new StorageManager();

  try {
    const formData = await req.formData();
    const image = formData.get('image');
    const dataString = formData.get('data');
    
    if (!image || !dataString) {
      throw new Error('Missing required fields');
    }

    const data = JSON.parse(dataString);
    console.log(`[${uploadId}] Parsed data:`, data);

    const { originalImageUrl } = await storageManager.uploadOriginalImage(uploadId, image);
    console.log(`[${uploadId}] Original image URL:`, originalImageUrl);

    // Create canvas with the specified dimensions
    const canvas = createCanvas(data.width, data.height);
    const ctx = canvas.getContext('2d');

    // Load and draw the background image
    const imageArrayBuffer = await (image as Blob).arrayBuffer();
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
    ctx.font = `bold ${fontSize}px ${data.font_url.split('family=')[1]?.split(':')[0]?.replace(/\+/g, ' ') || 'Arial'}`;
    ctx.fillText(data.headline, data.width / 2, data.height * 0.4, data.width * 0.8);

    // Draw description
    if (data.description) {
      const descFontSize = Math.floor(fontSize * 0.7);
      ctx.font = `${descFontSize}px ${data.font_url.split('family=')[1]?.split(':')[0]?.replace(/\+/g, ' ') || 'Arial'}`;
      ctx.fillStyle = data.description_color;
      ctx.fillText(data.description, data.width / 2, data.height * 0.5, data.width * 0.8);
    }

    // Draw CTA button
    if (data.cta_text) {
      const buttonWidth = Math.min(data.width * 0.4, 200);
      const buttonHeight = Math.floor(fontSize * 1.5);
      const buttonX = (data.width - buttonWidth) / 2;
      const buttonY = data.height * 0.7;

      ctx.fillStyle = data.cta_color;
      ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, buttonHeight / 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.floor(fontSize * 0.6)}px ${data.font_url.split('family=')[1]?.split(':')[0]?.replace(/\+/g, ' ') || 'Arial'}`;
      ctx.fillText(data.cta_text, data.width / 2, buttonY + buttonHeight / 2, buttonWidth * 0.9);
    }

    // Convert canvas to buffer
    const imageBuffer = canvas.toBuffer();

    // Upload generated image
    const { generatedImageUrl } = await storageManager.uploadGeneratedImage(uploadId, imageBuffer);
    console.log(`[${uploadId}] Generated image URL:`, generatedImageUrl);

    return new Response(
      JSON.stringify({
        imageUrl: generatedImageUrl,
        originalImageUrl,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error(`[${uploadId}] Error:`, error);
    
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