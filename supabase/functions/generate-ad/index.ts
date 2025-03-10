
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCanvas, loadImage } from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.0';
import { StorageManager } from './storageManager.ts';

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
    const fastMode = formData.get('fastMode') === 'true';
    
    if (!imageFile || !dataString) {
      throw new Error('Missing required fields');
    }

    const data = JSON.parse(dataString);
    console.log(`[${uploadId}] Parsed data:`, data);

    // Skip generating the image if we're in fast mode and an image URL is already provided
    if (fastMode && data.existingImageUrl) {
      console.log(`[${uploadId}] Fast mode active with existing URL: ${data.existingImageUrl}`);
      return new Response(
        JSON.stringify({ 
          imageUrl: data.existingImageUrl, 
          success: true, 
          fastMode: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process image file
    let imageArrayBuffer: ArrayBuffer;
    
    if (imageFile instanceof File || imageFile instanceof Blob) {
      imageArrayBuffer = await imageFile.arrayBuffer();
    } else if (typeof imageFile === 'string') {
      const response = await fetch(imageFile);
      imageArrayBuffer = await response.arrayBuffer();
    } else {
      throw new Error('Invalid image data type');
    }

    // Create storage manager
    const storageManager = new StorageManager();
    
    // First, quickly upload the original image and return its URL
    try {
      const { originalImageUrl } = await storageManager.uploadOriginalImage(uploadId, imageArrayBuffer);
      
      // If we're in fast mode, return immediately with the original image URL
      if (fastMode) {
        console.log(`[${uploadId}] Fast mode: returning original image URL`);
        return new Response(
          JSON.stringify({ 
            imageUrl: originalImageUrl, 
            success: true, 
            fastMode: true 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // If not in fast mode, continue with full image processing
      console.log(`[${uploadId}] Standard mode: proceeding with image generation`);
    } catch (uploadError) {
      console.error(`[${uploadId}] Error uploading original:`, uploadError);
      // Continue with processing even if original upload fails
    }

    // Create canvas with optimized settings
    const canvas = createCanvas(data.width, data.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Optimize image loading
    const backgroundImage = await loadImage(imageArrayBuffer);
    console.log(`[${uploadId}] Image loaded:`, backgroundImage.width, 'x', backgroundImage.height);

    // Fill background with black to ensure no transparent areas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, data.width, data.height);
    
    // Calculate aspect ratios
    const imageAspect = backgroundImage.width / backgroundImage.height;
    const canvasAspect = data.width / data.height;
    
    // Variables for drawing
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = backgroundImage.width;
    let sourceHeight = backgroundImage.height;
    
    // IMPORTANT: Use the EXACT same positioning logic as the AdPreviewImage component
    // This ensures consistency between preview and final render
    let destX = data.imagePosition?.x || 0;
    let destY = data.imagePosition?.y || 0;
    let destWidth = data.width;
    let destHeight = data.height;

    // Draw the image with exactly the same positioning as in the preview
    ctx.drawImage(backgroundImage, sourceX, sourceY, sourceWidth, sourceHeight, 
                  destX, destY, destWidth, destHeight);

    // Draw overlay
    ctx.save();
    ctx.globalAlpha = data.overlayOpacity || 0.4;
    ctx.fillStyle = data.overlay_color || 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, data.width, data.height);
    ctx.restore();

    // Draw text elements
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw headline
    if (data.headline) {
      const fontSize = Math.floor(data.width * 0.06);
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = data.text_color || '#FFFFFF';
      const headlineX = data.width / 2 + (data.headlinePosition?.x || 0);
      const headlineY = data.height * 0.4 + (data.headlinePosition?.y || 0);
      ctx.fillText(data.headline, headlineX, headlineY);
    }

    // Draw description
    if (data.description) {
      const descFontSize = Math.floor(data.width * 0.04);
      ctx.font = `${descFontSize}px Arial`;
      ctx.fillStyle = data.description_color || '#FFFFFF';
      const descX = data.width / 2 + (data.descriptionPosition?.x || 0);
      const descY = data.height * 0.5 + (data.descriptionPosition?.y || 0);
      ctx.fillText(data.description, descX, descY);
    }

    // Draw CTA button
    if (data.cta_text) {
      const buttonWidth = Math.min(data.width * 0.4, 200);
      const buttonHeight = Math.floor(data.width * 0.06);
      const ctaX = (data.width - buttonWidth) / 2 + (data.ctaPosition?.x || 0);
      const ctaY = data.height * 0.65 + (data.ctaPosition?.y || 0);

      // Draw button background
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

      // Draw button text
      ctx.fillStyle = '#FFFFFF';
      const fontSize = Math.floor(buttonHeight * 0.6);
      ctx.font = `bold ${fontSize}px Arial`;
      
      const textWidth = ctx.measureText(data.cta_text).width;
      const arrowWidth = fontSize * 0.3;
      const spacing = fontSize * 0.3;
      
      const contentWidth = data.showArrow !== false ? textWidth + arrowWidth + spacing : textWidth;
      const startX = ctaX + (buttonWidth - contentWidth) / 2;
      
      ctx.fillText(data.cta_text, startX + textWidth/2, ctaY + buttonHeight/2);

      // Draw arrow if needed
      if (data.showArrow !== false) {
        const arrowX = startX + textWidth + spacing;
        const arrowY = ctaY + buttonHeight/2;
        const arrowSize = fontSize * 0.4;

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF';
        
        ctx.moveTo(arrowX, arrowY - arrowSize/2);
        ctx.lineTo(arrowX, arrowY + arrowSize/2);
        
        ctx.moveTo(arrowX - arrowSize/3, arrowY - arrowSize/4);
        ctx.lineTo(arrowX, arrowY - arrowSize/2);
        ctx.lineTo(arrowX + arrowSize/3, arrowY - arrowSize/4);
        
        ctx.moveTo(arrowX - arrowSize/3, arrowY + arrowSize/4);
        ctx.lineTo(arrowX, arrowY + arrowSize/2);
        ctx.lineTo(arrowX + arrowSize/3, arrowY + arrowSize/4);
        
        ctx.stroke();
      }
    }

    // Export the generated image with optimized settings
    const imageBuffer = canvas.toBuffer();
    
    // Upload the generated image using StorageManager
    const { generatedImageUrl } = await storageManager.uploadGeneratedImage(uploadId, imageBuffer);

    // Return the response immediately
    return new Response(
      JSON.stringify({ imageUrl: generatedImageUrl, success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${uploadId}] Error:`, error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
