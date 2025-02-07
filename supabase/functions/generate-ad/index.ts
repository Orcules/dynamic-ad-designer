import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const uploadId = crypto.randomUUID();
    console.log(`[${uploadId}] Starting ad generation process`);

    const formData = await req.formData();
    const image = formData.get('image');
    const jsonData = formData.get('data');

    if (!image || !jsonData) {
      throw new Error('Missing required fields');
    }

    const data = JSON.parse(jsonData.toString());
    console.log(`[${uploadId}] Parsed data:`, data);

    const imageArrayBuffer = await (image as Blob).arrayBuffer();
    const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageArrayBuffer)));

    let browser = null;
    try {
      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { margin: 0; }
              .ad-container {
                width: ${data.width}px;
                height: ${data.height}px;
                position: relative;
                overflow: hidden;
              }
              .image-container {
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
                background-color: ${data.overlay_color};
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
                color: ${data.text_color};
                text-align: center;
              }
              .headline {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
                color: ${data.text_color};
              }
              .description {
                font-size: 16px;
                margin-bottom: 15px;
                color: ${data.description_color};
              }
              .cta {
                padding: 10px 20px;
                background-color: ${data.cta_color};
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
              }
            </style>
          </head>
          <body>
            <div class="ad-container">
              <div class="image-container">
                <img class="image" src="data:image/jpeg;base64,${imageBase64}" />
                <div class="overlay"></div>
              </div>
              <div class="content">
                <div class="headline">${data.headline}</div>
                ${data.description ? `<div class="description">${data.description}</div>` : ''}
                ${data.cta_text ? `<button class="cta">${data.cta_text}</button>` : ''}
              </div>
            </div>
          </body>
        </html>
      `;

      await page.setContent(html);
      await page.setViewport({ width: data.width, height: data.height });

      const screenshotBuffer = await page.screenshot({
        type: 'jpeg',
        quality: 90,
        clip: {
          x: 0,
          y: 0,
          width: data.width,
          height: data.height
        }
      });

      await browser.close();
      browser = null;
      console.log(`[${uploadId}] Browser closed`);

      const timestamp = Date.now();
      const fileName = `${uploadId}_${timestamp}.jpg`;
      const generatedFileName = `generated/${fileName}`;
      
      console.log(`[${uploadId}] Generated file name:`, generatedFileName);

      return new Response(
        JSON.stringify({
          imageBuffer: Array.from(new Uint8Array(screenshotBuffer)),
          fileName: generatedFileName,
          success: true
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
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
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    } finally {
      if (browser) {
        try {
          await browser.close();
          console.log(`[${uploadId}] Browser closed in finally block`);
        } catch (error) {
          console.error(`[${uploadId}] Error closing browser:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Top level error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});