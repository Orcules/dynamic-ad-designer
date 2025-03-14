
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
    const renderedPreview = formData.get('renderedPreview');
    
    if (!imageFile || !dataString) {
      throw new Error('Missing required fields');
    }

    const data = JSON.parse(dataString);
    console.log(`[${uploadId}] Parsed data:`, data);

    const adName = data.headline ? `${data.headline}` : 'Untitled Ad';
    const language = data.language || 'unknown';
    const fontName = data.fontName || 'default';
    const aspectRatio = data.aspectRatio || `${data.width}-${data.height}`;
    const templateStyle = data.template_style || data.templateStyle || 'standard';
    const version = data.version || 1;

    const storageManager = new StorageManager();

    if (renderedPreview) {
      console.log(`[${uploadId}] Using provided rendered preview`);
      
      if (typeof renderedPreview === 'string' && renderedPreview.startsWith('data:')) {
        try {
          const { renderedUrl } = await storageManager.uploadRenderedPreview(
            uploadId, 
            renderedPreview, 
            adName,
            language,
            fontName,
            aspectRatio,
            templateStyle,
            version
          );
          
          console.log(`[${uploadId}] Successfully uploaded rendered preview`);
          
          return new Response(
            JSON.stringify({ 
              imageUrl: renderedUrl, 
              success: true, 
              fastMode: true,
              renderedPreview: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (previewError) {
          console.error(`[${uploadId}] Error processing rendered preview:`, previewError);
        }
      }
    }

    let imageArrayBuffer: ArrayBuffer;
    
    if (imageFile instanceof File || imageFile instanceof Blob) {
      imageArrayBuffer = await imageFile.arrayBuffer();
    } else if (typeof imageFile === 'string') {
      const response = await fetch(imageFile);
      imageArrayBuffer = await response.arrayBuffer();
    } else {
      throw new Error('Invalid image data type');
    }
    
    try {
      const { originalImageUrl } = await storageManager.uploadOriginalImage(
        uploadId, 
        imageArrayBuffer, 
        adName,
        language,
        fontName,
        aspectRatio,
        templateStyle,
        version
      );
      
      if (fastMode && !renderedPreview) {
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
      
      console.log(`[${uploadId}] Standard mode: proceeding with image generation`);
    } catch (uploadError) {
      console.error(`[${uploadId}] Error uploading original:`, uploadError);
    }

    const canvas = createCanvas(data.width, data.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    const isLuxuryJewelry = data.template_style === 'luxury-jewelry';

    if (isLuxuryJewelry) {
      ctx.fillStyle = "#C70039";
      ctx.fillRect(0, 0, data.width, data.height);
      
      ctx.save();
      ctx.strokeStyle = "rgba(0,0,0,0.05)";
      ctx.lineWidth = 1;
      
      for (let i = 0; i < data.width * 2; i += 6) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i - data.height, data.height);
        ctx.stroke();
      }
      
      ctx.restore();
    } else {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, data.width, data.height);
    }
    
    const backgroundImage = await loadImage(imageArrayBuffer);
    console.log(`[${uploadId}] Image loaded:`, backgroundImage.width, 'x', backgroundImage.height);
    
    const imagePosition = data.imagePosition || { x: 0, y: 0 };
    
    const imageAspect = backgroundImage.width / backgroundImage.height;
    const canvasAspect = data.width / data.height;
    
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = backgroundImage.width;
    let sourceHeight = backgroundImage.height;
    let destX = 0;
    let destY = 0;
    let destWidth, destHeight, scale = 1;

    // Use the improved scaling logic that guarantees full coverage
    if (imageAspect > canvasAspect) {
      // Image is wider than container - scale based on height
      destHeight = data.height;
      destWidth = data.height * imageAspect;
      
      // If width is still smaller than canvas width, scale up
      if (destWidth < data.width) {
        scale = data.width / destWidth;
        destWidth *= scale;
        destHeight *= scale;
      }
      
      destX = (data.width - destWidth) / 2 + imagePosition.x;
      destY = (data.height - destHeight) / 2 + imagePosition.y;
    } else {
      // Image is taller than container - scale based on width
      destWidth = data.width;
      destHeight = data.width / imageAspect;
      
      // If height is still smaller than canvas height, scale up
      if (destHeight < data.height) {
        scale = data.height / destHeight;
        destWidth *= scale;
        destHeight *= scale;
      }
      
      destX = (data.width - destWidth) / 2 + imagePosition.x;
      destY = (data.height - destHeight) / 2 + imagePosition.y;
    }
    
    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) {
      ctx.imageSmoothingQuality = 'high';
    }
    
    console.log(`[${uploadId}] Image dimensions:`, {
      source: { width: sourceWidth, height: sourceHeight },
      dest: { width: destWidth, height: destHeight, x: destX, y: destY },
      aspect: { image: imageAspect, canvas: canvasAspect },
      scale: scale
    });
    
    if (isLuxuryJewelry) {
      const padding = Math.round(data.width * 0.04);
      const cornerRadius = Math.round(data.width * 0.1);
      const drawWidth = data.width - (padding * 2);
      
      let drawHeight;
      if (imageAspect > drawWidth / (data.height - padding * 2)) {
        drawHeight = data.height - (padding * 2);
      } else {
        drawHeight = drawWidth / imageAspect;
      }
      
      const drawX = padding;
      const drawY = Math.max(padding, (data.height - drawHeight) / 2);
      
      const tempCanvas = createCanvas(destWidth, destHeight);
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        tempCtx.drawImage(
          backgroundImage, 
          sourceX, sourceY, sourceWidth, sourceHeight, 
          0, 0, destWidth, destHeight
        );
        
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(drawX + cornerRadius, drawY);
        ctx.lineTo(drawX + drawWidth - cornerRadius, drawY);
        ctx.arcTo(drawX + drawWidth, drawY, drawX + drawWidth, drawY + cornerRadius, cornerRadius);
        ctx.lineTo(drawX + drawWidth, drawY + drawHeight - cornerRadius);
        ctx.arcTo(drawX + drawWidth, drawY + drawHeight, drawX + drawWidth - cornerRadius, drawY + drawHeight, cornerRadius);
        ctx.lineTo(drawX + cornerRadius, drawY + drawHeight);
        ctx.arcTo(drawX, drawY + drawHeight, drawX, drawY + drawHeight - cornerRadius, cornerRadius);
        ctx.lineTo(drawX, drawY + cornerRadius);
        ctx.arcTo(drawX, drawY, drawX + cornerRadius, drawY, cornerRadius);
        ctx.closePath();
        ctx.clip();
        
        ctx.drawImage(
          tempCanvas, 
          0, 0, destWidth, destHeight,
          drawX, drawY, drawWidth, drawHeight
        );
        ctx.restore();
      } else {
        throw new Error('Failed to get temporary canvas context');
      }
    } else {
      ctx.drawImage(
        backgroundImage, 
        sourceX, sourceY, sourceWidth, sourceHeight, 
        destX, destY, destWidth, destHeight
      );
    }

    if (!isLuxuryJewelry) {
      ctx.save();
      ctx.globalAlpha = data.overlayOpacity || 0.4;
      ctx.fillStyle = data.overlay_color || 'rgba(0, 0, 0, 1)';
      ctx.fillRect(0, 0, data.width, data.height);
      ctx.restore();
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (data.headline) {
      const fontSize = Math.floor(data.width * 0.06);
      
      if (isLuxuryJewelry) {
        ctx.fillStyle = '#F4D03F';
        ctx.font = `bold ${fontSize * 1.2}px Arial`;
        ctx.textTransform = 'uppercase';
      } else {
        ctx.fillStyle = data.text_color || '#FFFFFF';
        ctx.font = `bold ${fontSize}px Arial`;
      }
      
      const headlineX = data.width / 2 + (data.headlinePosition?.x || 0);
      const headlineY = data.height * 0.4 + (data.headlinePosition?.y || 0) - 7;
      
      const headlineText = isLuxuryJewelry ? data.headline.toUpperCase() : data.headline;
      ctx.fillText(headlineText, headlineX, headlineY);
    }

    if (data.description) {
      const descFontSize = Math.floor(data.width * 0.04);
      
      if (isLuxuryJewelry) {
        ctx.fillStyle = '#F4D03F';
        ctx.font = `500 ${descFontSize}px Arial`;
      } else {
        ctx.fillStyle = data.description_color || '#FFFFFF';
        ctx.font = `${descFontSize}px Arial`;
      }
      
      const descX = data.width / 2 + (data.descriptionPosition?.x || 0);
      const descY = data.height * 0.5 + (data.descriptionPosition?.y || 0) - 7;
      ctx.fillText(data.description, descX, descY);
    }

    if (data.cta_text) {
      const buttonWidth = Math.min(data.width * 0.4, 200);
      const buttonHeight = Math.floor(data.width * 0.06);
      const ctaX = (data.width - buttonWidth) / 2 + (data.ctaPosition?.x || 0);
      const ctaY = data.height * 0.65 + (data.ctaPosition?.y || 0);

      if (isLuxuryJewelry) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        const borderRadius = buttonHeight;
        
        ctx.beginPath();
        ctx.moveTo(ctaX + borderRadius, ctaY);
        ctx.lineTo(ctaX + buttonWidth - borderRadius, ctaY);
        ctx.arc(ctaX + buttonWidth - borderRadius, ctaY + borderRadius, borderRadius, -Math.PI/2, Math.PI/2);
        ctx.lineTo(ctaX + borderRadius, ctaY + buttonHeight);
        ctx.arc(ctaX + borderRadius, ctaY + borderRadius, borderRadius, Math.PI/2, -Math.PI/2);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#F4D03F';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
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
      }

      ctx.fillStyle = isLuxuryJewelry ? '#F4D03F' : '#FFFFFF';
      const fontSize = Math.floor(buttonHeight * 0.6);
      ctx.font = isLuxuryJewelry ? `600 ${fontSize}px Arial` : `bold ${fontSize}px Arial`;
      
      const textWidth = ctx.measureText(data.cta_text).width;
      const arrowWidth = fontSize * 0.3;
      const spacing = fontSize * 0.3;
      
      const buttonText = isLuxuryJewelry ? data.cta_text.toUpperCase() : data.cta_text;
      const showArrow = data.showArrow !== false && !isLuxuryJewelry;
      
      const contentWidth = showArrow ? textWidth + arrowWidth + spacing : textWidth;
      const startX = ctaX + (buttonWidth - contentWidth) / 2;
      
      ctx.fillText(buttonText, startX + textWidth/2, ctaY + buttonHeight/2 - 7);

      if (showArrow) {
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

    const drawPageFlip = () => {
      const cornerSize = Math.floor(data.width * 0.15);
      const foldSize = Math.floor(cornerSize * 0.4);
      
      ctx.save();
      
      ctx.fillStyle = isLuxuryJewelry ? '#f8e9b0' : '#f3f3f3';
      
      ctx.beginPath();
      ctx.moveTo(data.width - cornerSize, data.height);
      ctx.lineTo(data.width, data.height - cornerSize);
      ctx.lineTo(data.width, data.height);
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(data.width - cornerSize, data.height);
      ctx.lineTo(data.width, data.height - cornerSize);
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.beginPath();
      ctx.moveTo(data.width - cornerSize/5, data.height);
      ctx.lineTo(data.width, data.height - cornerSize/5);
      ctx.lineTo(data.width, data.height);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    };
    
    drawPageFlip();

    const imageBuffer = canvas.toBuffer();
    
    const { generatedImageUrl } = await storageManager.uploadGeneratedImage(
      uploadId, 
      imageBuffer, 
      adName,
      language,
      fontName,
      aspectRatio,
      templateStyle,
      version
    );
    
    console.log(`[${uploadId}] Generated image URL: ${generatedImageUrl}`);

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
