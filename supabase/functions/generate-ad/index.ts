
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
    } else if (typeof imageFile === 'string') {
      const response = await fetch(imageFile);
      imageArrayBuffer = await response.arrayBuffer();
    } else {
      throw new Error('Invalid image data type');
    }

    const canvas = createCanvas(data.width, data.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

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
    let destX = 0;
    let destY = 0;
    let destWidth = data.width;
    let destHeight = data.height;

    // Apply image position offset
    const offsetX = data.imagePosition?.x || 0;
    const offsetY = data.imagePosition?.y || 0;
    
    // Draw the image using the object-fit: cover approach
    if (imageAspect > canvasAspect) {
      // Image is wider than canvas - maintain height and crop width
      const scaleFactor = data.height / backgroundImage.height;
      const scaledWidth = backgroundImage.width * scaleFactor;
      
      // Center the image horizontally in the canvas
      destX = (data.width - scaledWidth) / 2 + offsetX;
      destY = offsetY;
      destWidth = scaledWidth;
      destHeight = data.height;
    } else {
      // Image is taller than canvas - maintain width and crop height
      const scaleFactor = data.width / backgroundImage.width;
      const scaledHeight = backgroundImage.height * scaleFactor;
      
      // Center the image vertically in the canvas
      destX = offsetX;
      destY = (data.height - scaledHeight) / 2 + offsetY;
      destWidth = data.width;
      destHeight = scaledHeight;
    }

    // Draw the image with the calculated dimensions
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

    // Export and upload the generated image
    const imageBuffer = canvas.toBuffer();
    const timestamp = Date.now();
    const filePath = `full-ads/${timestamp}_ad.png`;

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

    const { data: { publicUrl } } = supabase.storage
      .from('ad-images')
      .getPublicUrl(filePath);

    return new Response(
      JSON.stringify({ imageUrl: publicUrl, success: true }),
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
