import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  let uploadId: string | null = null;
  let browser = null;

  try {
    const formData = await req.formData();
    uploadId = formData.get('uploadId') as string;
    const data = JSON.parse(formData.get('data') as string);
    const imageFile = formData.get('image') as File;
    
    console.log(`[${uploadId}] Starting to generate ad with data:`, data);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let imageUrl = data.image_url;
    if (imageFile) {
      const timestamp = Date.now();
      const fileName = `generated/${uploadId}_${timestamp}_${imageFile.name}`.replace(/[^\x00-\x7F]/g, '');
      
      console.log(`[${uploadId}] Uploading image to storage:`, fileName);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ad-images')
        .upload(fileName, imageFile, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        console.error(`[${uploadId}] Upload error:`, uploadError);
        throw uploadError;
      }

      console.log(`[${uploadId}] Image uploaded successfully`);

      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(fileName);

      imageUrl = publicUrl;
    }

    console.log(`[${uploadId}] Creating HTML content`);
    const html = `
      <html>
        <head>
          <style>
            @import url('${data.font_url}');
            
            body {
              margin: 0;
              padding: 0;
              width: ${data.width}px;
              height: ${data.height}px;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            
            .ad-container {
              position: relative;
              width: 100%;
              height: 100%;
            }
            
            .background-image {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              object-fit: cover;
              object-position: ${data.imagePosition?.x || 0}% ${data.imagePosition?.y || 0}%;
            }
            
            .overlay {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: ${data.overlay_color}${Math.round(data.overlayOpacity * 255).toString(16).padStart(2, '0')};
            }
            
            .content {
              position: relative;
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              box-sizing: border-box;
              font-family: '${data.font_url.split('family=')[1].split(':')[0].replace(/\+/g, ' ')}', sans-serif;
            }
            
            .headline {
              color: ${data.text_color};
              text-align: center;
              font-size: ${data.width * 0.05}px;
              position: absolute;
              transform: translate(${data.headlinePosition?.x || 0}%, ${data.headlinePosition?.y || 0}%);
              max-width: 80%;
              font-weight: bold;
            }

            .description {
              color: ${data.description_color};
              text-align: center;
              font-size: ${data.width * 0.03}px;
              position: absolute;
              transform: translate(${data.descriptionPosition?.x || 0}%, ${data.descriptionPosition?.y || 0}%);
              max-width: 70%;
            }
            
            .cta-button {
              background: ${data.cta_color};
              color: white;
              padding: 1rem 2rem;
              border-radius: 8px;
              font-size: ${data.width * 0.03}px;
              font-weight: bold;
              position: absolute;
              transform: translate(${data.ctaPosition?.x || 0}%, ${data.ctaPosition?.y || 0}%);
              white-space: nowrap;
              border: none;
            }
          </style>
        </head>
        <body>
          <div class="ad-container">
            ${imageUrl ? `<img src="${imageUrl}" class="background-image" />` : ''}
            <div class="overlay"></div>
            <div class="content">
              ${data.headline ? `<h1 class="headline">${data.headline}</h1>` : ''}
              ${data.description ? `<p class="description">${data.description}</p>` : ''}
              ${data.cta_text ? `<button class="cta-button">${data.cta_text}</button>` : ''}
            </div>
          </div>
        </body>
      </html>
    `;

    console.log(`[${uploadId}] Launching browser`);
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    await page.setViewport({
      width: data.width,
      height: data.height
    });

    console.log(`[${uploadId}] Setting page content`);
    await page.setContent(html);
    await page.evaluateHandle('document.fonts.ready');

    console.log(`[${uploadId}] Taking screenshot`);
    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality: 90,
      fullPage: true
    });

    await browser.close();
    browser = null;
    console.log(`[${uploadId}] Browser closed`);

    const generatedFileName = `generated/${uploadId}_${Date.now()}_${data.name}.jpg`.replace(/[^\x00-\x7F]/g, '');
    
    console.log(`[${uploadId}] Uploading generated image:`, generatedFileName);
    const { error: saveError } = await supabase.storage
      .from('ad-images')
      .upload(generatedFileName, screenshot, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (saveError) {
      console.error(`[${uploadId}] Save error:`, saveError);
      throw saveError;
    }

    console.log(`[${uploadId}] Getting public URL`);
    const { data: { publicUrl: generatedUrl } } = supabase.storage
      .from('ad-images')
      .getPublicUrl(generatedFileName);

    console.log(`[${uploadId}] Successfully generated ad image:`, generatedUrl);

    return new Response(
      JSON.stringify({ success: true, imageUrl: generatedUrl }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error(`[${uploadId}] Error generating ad:`, error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.error(`[${uploadId}] Error closing browser:`, error);
      }
    }
  }
});