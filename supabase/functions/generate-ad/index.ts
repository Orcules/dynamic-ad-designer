import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { BrowserManager } from "./browserManager.ts";
import { generateAdHtml } from "./htmlGenerator.ts";
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

  const browserManager = new BrowserManager();
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

    console.log(`[${uploadId}] Launching browser`);
    await browserManager.launch();

    const page = await browserManager.createPage(data.width, data.height);
    
    const imageArrayBuffer = await (image as Blob).arrayBuffer();
    const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageArrayBuffer)));

    const html = generateAdHtml(data, imageBase64);
    await page.setContent(html);
    console.log(`[${uploadId}] Page content set`);

    const screenshotBuffer = await page.screenshot({
      type: 'jpeg',
      quality: 90
    });

    console.log(`[${uploadId}] Screenshot taken`);
    await browserManager.close();
    console.log(`[${uploadId}] Browser closed`);

    const { generatedImageUrl } = await storageManager.uploadGeneratedImage(uploadId, screenshotBuffer);
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
    await browserManager.close();
    console.log(`[${uploadId}] Browser closed after error`);
    
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