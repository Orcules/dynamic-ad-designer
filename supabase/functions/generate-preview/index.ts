
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { chromium } from "https://deno.land/x/playwright@0.4.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting generate-preview function');
    const { url, selector } = await req.json();
    console.log('Request params:', { url, selector });

    if (!url || typeof url !== 'string') {
      console.error('Invalid URL parameter');
      return new Response(
        JSON.stringify({ error: 'URL parameter is required.' }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    console.log('Launching browser');
    const browser = await chromium.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    console.log('Creating new page');
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('Setting viewport');
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('Navigating to URL:', url);
    await page.goto(url, { 
      waitUntil: 'networkidle'
    });
    
    const elementSelector = selector || '.ad-content';
    console.log('Waiting for selector:', elementSelector);
    
    const element = await page.waitForSelector(elementSelector, { 
      timeout: 5000,
      state: 'visible'
    });
    
    if (!element) {
      console.error('Element not found');
      await browser.close();
      return new Response(
        JSON.stringify({ error: 'Element not found.' }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404 
        }
      );
    }

    console.log('Taking screenshot');
    const screenshot = await element.screenshot({
      type: 'png',
      omitBackground: true
    });

    // Convert the screenshot to base64
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(screenshot)));
    
    console.log('Closing browser');
    await browser.close();

    console.log('Returning response');
    return new Response(
      JSON.stringify({ image: base64Image }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in generate-preview:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error generating image.',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
