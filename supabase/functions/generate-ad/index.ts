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
    // Check if we already have a rendered preview to use
    const renderedPreview = formData.get('renderedPreview');
    
    if (!imageFile || !dataString) {
      throw new Error('Missing required fields');
    }

    const data = JSON.parse(dataString);
    console.log(`[${uploadId}] Parsed data:`, data);

    // Extract all metadata for file naming
    const adName = data.headline ? `${data.headline}` : 'Untitled Ad';
    const language = data.language || 'unknown';
    const fontName = data.fontName || 'default';
    const aspectRatio = data.aspectRatio || `${data.width}-${data.height}`;
    const templateStyle = data.template_style || data.templateStyle || 'standard';
    const version = data.version || 1;

    // Create storage manager
    const storageManager = new StorageManager();
    
    // If we have a rendered preview, use it directly
    if (renderedPreview) {
      console.log(`[${uploadId}] Using provided rendered preview`);
      
      // Process the rendered preview - it should be a base64 data URL
      if (typeof renderedPreview === 'string' && renderedPreview.startsWith('data:')) {
        try {
          // Upload the rendered preview directly with all metadata
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
          // Continue with normal processing if preview processing fails
        }
      }
    }

    // Process image file for standard processing
    let imageArrayBuffer: ArrayBuffer;
    
    if (imageFile instanceof File || imageFile instanceof Blob) {
      imageArrayBuffer = await imageFile.arrayBuffer();
    } else if (typeof imageFile === 'string') {
      const response = await fetch(imageFile);
      imageArrayBuffer = await response.arrayBuffer();
    } else {
      throw new Error('Invalid image data type');
    }
    
    // First, upload the original image and return its URL if we're in fast mode
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
      
      // If we're in fast mode, return immediately with the original image URL
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
      // Continue with processing even if original upload fails
    }

    // Create canvas with optimized settings
    const canvas = createCanvas(data.width, data.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Check if we're using the luxury jewelry template
    const isLuxuryJewelry = data.template_style === 'luxury-jewelry';

    // Fill background with template-specific color
    if (isLuxuryJewelry) {
      ctx.fillStyle = "#C70039"; // Crimson background for luxury jewelry
      ctx.fillRect(0, 0, data.width, data.height);
      
      // Add diamond pattern for luxury jewelry template
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
      // Default black background for other templates
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, data.width, data.height);
    }
    
    // Optimize image loading
    const backgroundImage = await loadImage(imageArrayBuffer);
    console.log(`[${uploadId}] Image loaded:`, backgroundImage.width, 'x', backgroundImage.height);
    
    // CRITICAL: Use the exact image position from the client without recalculation
    const imagePosition = data.imagePosition || { x: 0, y: 0 };
    console.log(`[${uploadId}] Using exact image position from client:`, imagePosition);
    
    // Helper function that mirrors the simplified calculateCoverDimensions logic
    const calculateCoverDimensionsServer = (
      imageWidth: number,
      imageHeight: number,
      containerWidth: number,
      containerHeight: number,
      offsetX = 0,
      offsetY = 0
    ) => {
      const imageAspect = imageWidth / imageHeight;
      const containerAspect = containerWidth / containerHeight;
      
      let width, height, x, y;
      
      if (imageAspect > containerAspect) {
        // Image is wider than container - scale to match height and center horizontally
        height = containerHeight;
        width = containerHeight * imageAspect;
        y = 0;
        x = (containerWidth - width) / 2;
      } else {
        // Image is taller than container - scale to match width and center vertically
        width = containerWidth;
        height = containerWidth / imageAspect;
        x = 0;
        y = (containerHeight - height) / 2;
      }
      
      // Apply the EXACT offsets as provided by the client without ANY modification
      x += offsetX;
      y += offsetY;
      
      return { width, height, x, y };
    };
    
    // Calculate dimensions ensuring image covers the container completely
    // Use the exact same calculation as client-side with the exact same position from client
    const coverDimensions = calculateCoverDimensionsServer(
      backgroundImage.width,
      backgroundImage.height,
      data.width,
      data.height, 
      imagePosition.x,
      imagePosition.y
    );
    
    const destWidth = coverDimensions.width;
    const destHeight = coverDimensions.height;
    const destX = coverDimensions.x;
    const destY = coverDimensions.y;
    
    // Log positioning information for debugging
    console.log(`[${uploadId}] Final image dimensions:`, {
      source: { width: backgroundImage.width, height: backgroundImage.height },
      dest: { width: destWidth, height: destHeight, x: destX, y: destY },
      clientPosition: imagePosition
    });
    
    // Draw the image with the calculated dimensions to ensure full coverage
    if (isLuxuryJewelry) {
      // Add padding (4% of the canvas width)
      const padding = Math.round(data.width * 0.04);
      const cornerRadius = Math.round(data.width * 0.1); // 10% of width for rounded corners
      
      // Create a temporary canvas for the image
      const tempCanvas = createCanvas(destWidth, destHeight);
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        // Draw the image to the temporary canvas with object-fit: cover behavior
        tempCtx.drawImage(
          backgroundImage, 
          0, 0, backgroundImage.width, backgroundImage.height, 
          0, 0, destWidth, destHeight
        );
        
        // Now draw the image with rounded corners to the main canvas
        ctx.save();
        
        // Create rounded rectangle path
        const drawWidth = data.width - (padding * 2);
        const drawHeight = (drawWidth / destWidth) * destHeight;
        const drawX = padding;
        const drawY = (data.height - drawHeight) / 2;
        
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
        
        // Clip to the rounded rectangle and draw the image
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
      // Draw the image with exact positioning to match the preview for non-luxury templates
      ctx.drawImage(
        backgroundImage, 
        0, 0, backgroundImage.width, backgroundImage.height, // Source rectangle (entire original image)
        destX, destY, destWidth, destHeight  // Destination rectangle (calculated for coverage)
      );
    }

    // Draw overlay (skip for luxury jewelry which handles its own background)
    if (!isLuxuryJewelry) {
      ctx.save();
      ctx.globalAlpha = data.overlayOpacity || 0.4;
      ctx.fillStyle = data.overlay_color || 'rgba(0, 0, 0, 1)';
      ctx.fillRect(0, 0, data.width, data.height);
      ctx.restore();
    }

    // Draw text elements
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw headline
    if (data.headline) {
      const fontSize = Math.floor(data.width * 0.06);
      
      if (isLuxuryJewelry) {
        // Gold color and uppercase for luxury jewelry
        ctx.fillStyle = '#F4D03F';
        ctx.font = `bold ${fontSize * 1.2}px Arial`;
        ctx.textTransform = 'uppercase'; // Note: This doesn't work in canvas directly, we'd need to transform the text
      } else {
        ctx.fillStyle = data.text_color || '#FFFFFF';
        ctx.font = `bold ${fontSize}px Arial`;
      }
      
      const headlineX = data.width / 2 + (data.headlinePosition?.x || 0);
      const headlineY = data.height * 0.4 + (data.headlinePosition?.y || 0) - 7;
      
      // For luxury jewelry, draw text in uppercase
      const headlineText = isLuxuryJewelry ? data.headline.toUpperCase() : data.headline;
      ctx.fillText(headlineText, headlineX, headlineY);
    }

    // Draw description
    if (data.description) {
      const descFontSize = Math.floor(data.width * 0.04);
      
      if (isLuxuryJewelry) {
        // Gold color for luxury jewelry
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

    // Draw CTA button - Important: ensure this is always visible
    if (data.cta_text) {
      const buttonWidth = Math.min(data.width * 0.4, 200);
      const buttonHeight = Math.floor(data.width * 0.06);
      const ctaX = (data.width - buttonWidth) / 2 + (data.ctaPosition?.x || 0);
      const ctaY = data.height * 0.65 + (data.ctaPosition?.y || 0);

      // Draw button background
      if (isLuxuryJewelry) {
        // Black background with gold border for luxury jewelry
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        const borderRadius = buttonHeight;
        
        // Draw button with circular ends
        ctx.beginPath();
        ctx.moveTo(ctaX + borderRadius, ctaY);
        ctx.lineTo(ctaX + buttonWidth - borderRadius, ctaY);
        ctx.arc(ctaX + buttonWidth - borderRadius, ctaY + borderRadius, borderRadius, -Math.PI/2, Math.PI/2);
        ctx.lineTo(ctaX + borderRadius, ctaY + buttonHeight);
        ctx.arc(ctaX + borderRadius, ctaY + borderRadius, borderRadius, Math.PI/2, -Math.PI/2);
        ctx.closePath();
        ctx.fill();
        
        // Gold border
        ctx.strokeStyle = '#F4D03F';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Standard button for other templates
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

      // Draw button text - adjusted to move the text up by 7px but NOT the arrow
      ctx.fillStyle = isLuxuryJewelry ? '#F4D03F' : '#FFFFFF';
      const fontSize = Math.floor(buttonHeight * 0.6);
      ctx.font = isLuxuryJewelry ? `600 ${fontSize}px Arial` : `bold ${fontSize}px Arial`;
      
      const textWidth = ctx.measureText(data.cta_text).width;
      const arrowWidth = fontSize * 0.3;
      const spacing = fontSize * 0.3;
      
      // For luxury jewelry, don't show arrow and use uppercase text
      const buttonText = isLuxuryJewelry ? data.cta_text.toUpperCase() : data.cta_text;
      const showArrow = data.showCtaArrow !== false && !isLuxuryJewelry;
      
      const contentWidth = showArrow ? textWidth + arrowWidth + spacing : textWidth;
      const startX = ctaX + (buttonWidth - contentWidth) / 2;
      
      // Move the text up, but not the arrow
      ctx.fillText(buttonText, startX + textWidth/2, ctaY + buttonHeight/2 - 7);

      // Draw arrow pointing downward
      if (showArrow) {
        const arrowX = startX + textWidth + spacing;
        const arrowY = ctaY + buttonHeight/2; // No adjustment for the arrow (keep it static)
        const arrowSize = fontSize * 0.4;

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF';
        
        // Draw a downward-pointing arrow
        ctx.moveTo(arrowX, arrowY - arrowSize/2);
        ctx.lineTo(arrowX, arrowY + arrowSize/2);
        ctx.moveTo(arrowX - arrowSize/3, arrowY);
        ctx.lineTo(arrowX, arrowY + arrowSize/2);
        ctx.lineTo(arrowX + arrowSize/3, arrowY);
        
        ctx.stroke();
      }
    }

    // Export the generated image with optimized settings for PNG format
    const imageBuffer = canvas.toBuffer();
    
    // Upload the generated image using StorageManager with correct content type and all metadata
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
