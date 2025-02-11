
import { serve } from "https://deno.fresh.dev/std/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer/mod.ts";

serve(async (req) => {
  try {
    const { url, selector } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'URL parameter is required.' }),
        { status: 400 }
      );
    }

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    const elementSelector = selector || '.ad-content';
    await page.waitForSelector(elementSelector);
    
    const element = await page.$(elementSelector);
    if (!element) {
      await browser.close();
      return new Response(
        JSON.stringify({ error: 'Element not found.' }),
        { status: 404 }
      );
    }

    const screenshot = await element.screenshot({ encoding: 'base64' });
    await browser.close();

    return new Response(
      JSON.stringify({ image: screenshot }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error generating image:', error);
    return new Response(
      JSON.stringify({ error: 'Error generating image.' }),
      { status: 500 }
    );
  }
});
