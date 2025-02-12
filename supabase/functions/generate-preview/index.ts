
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
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

    console.log('Initializing browser');
    const browser = await puppeteer.connect({
      browserWSEndpoint: `ws://localhost:9222`,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    console.log('Creating new page');
    const page = await browser.newPage();
    
    console.log('Setting viewport');
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('Navigating to URL:', url);
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    const elementSelector = selector || '.ad-content';
    console.log('Waiting for selector:', elementSelector);
    
    await page.waitForSelector(elementSelector);
    
    console.log('Taking screenshot');
    const element = await page.$(elementSelector);
    
    if (!element) {
      console.error('Element not found');
      await browser.close();
      return new Response(
        JSON.stringify({ error: 'Element not found' }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404 
        }
      );
    }

    const screenshot = await element.screenshot({
      type: 'png',
      encoding: 'base64'
    });
    
    await browser.close();
    console.log('Browser closed');

    return new Response(
      JSON.stringify({ image: screenshot }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error generating preview',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
