import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

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

  let browser = null;
  try {
    const formData = await req.formData();
    const image = formData.get('image');
    const dataString = formData.get('data');
    
    if (!image || !dataString) {
      throw new Error('Missing required fields');
    }

    const data = JSON.parse(dataString);
    console.log(`[${uploadId}] Parsed data:`, data);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const timestamp = Date.now();
    const originalFileName = `original/${uploadId}_${timestamp}.jpg`;
    console.log(`[${uploadId}] Uploading original image:`, originalFileName);

    const { error: uploadError } = await supabase.storage
      .from('ad-images')
      .upload(originalFileName, image, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error(`[${uploadId}] Upload error:`, uploadError);
      throw new Error('Failed to upload original image');
    }

    const { data: { publicUrl: originalImageUrl } } = supabase.storage
      .from('ad-images')
      .getPublicUrl(originalFileName);

    console.log(`[${uploadId}] Original image URL:`, originalImageUrl);

    console.log(`[${uploadId}] Launching browser`);
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: data.width,
      height: data.height
    });

    const imageArrayBuffer = await (image as Blob).arrayBuffer();
    const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageArrayBuffer)));

    const html = `
      <!DOCTYPE html>
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
              justify-content: center;
              align-items: center;
              position: relative;
              overflow: hidden;
            }
            .container {
              width: 100%;
              height: 100%;
              position: relative;
            }
            .image {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .overlay {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: ${data.overlay_color};
              opacity: ${data.overlayOpacity};
            }
            .content {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding: 20px;
              box-sizing: border-box;
              text-align: center;
              color: ${data.text_color};
              font-family: '${data.font_url.split('family=')[1]?.split(':')[0]?.replace(/\+/g, ' ')}', sans-serif;
            }
            .headline {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 16px;
            }
            .description {
              font-size: 18px;
              margin-bottom: 24px;
              color: ${data.description_color};
            }
            .cta {
              padding: 12px 24px;
              background: ${data.cta_color};
              color: white;
              border: none;
              border-radius: 4px;
              font-size: 16px;
              cursor: pointer;
              transition: opacity 0.2s;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="data:image/jpeg;base64,${imageBase64}" class="image" />
            <div class="overlay"></div>
            <div class="content">
              <div class="headline">${data.headline}</div>
              ${data.description ? `<div class="description">${data.description}</div>` : ''}
              <button class="cta">${data.cta_text}</button>
            </div>
          </div>
        </body>
      </html>
    `;

    await page.setContent(html);
    console.log(`[${uploadId}] Page content set`);

    const screenshotBuffer = await page.screenshot({
      type: 'jpeg',
      quality: 90
    });

    console.log(`[${uploadId}] Screenshot taken`);

    await browser.close();
    browser = null;
    console.log(`[${uploadId}] Browser closed`);

    const generatedFileName = `generated/${uploadId}_${timestamp}.jpg`;
    console.log(`[${uploadId}] Uploading generated image:`, generatedFileName);

    const { error: saveError } = await supabase.storage
      .from('ad-images')
      .upload(generatedFileName, screenshotBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (saveError) {
      console.error(`[${uploadId}] Save error:`, saveError);
      throw new Error('Failed to save generated image');
    }

    const { data: { publicUrl: generatedImageUrl } } = supabase.storage
      .from('ad-images')
      .getPublicUrl(generatedFileName);

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
    if (browser) {
      await browser.close();
      console.log(`[${uploadId}] Browser closed after error`);
    }
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