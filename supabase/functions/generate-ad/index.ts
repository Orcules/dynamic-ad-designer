import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData();
    const data = JSON.parse(formData.get('data') as string);
    
    console.log('Starting to generate ad with data:', data);

    // Launch browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Set viewport to match ad dimensions
    await page.setViewport({
      width: data.width,
      height: data.height
    });

    // Create HTML content
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
            }
            
            .overlay {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: linear-gradient(45deg, ${data.accent_color}88, ${data.accent_color}44);
            }
            
            .content {
              position: absolute;
              top: 0;
              left: 0;
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
              color: white;
              text-align: center;
              font-size: ${data.width * 0.05}px;
              margin-bottom: 2rem;
              max-width: 80%;
              font-weight: bold;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .cta-button {
              background: ${data.accent_color};
              color: white;
              padding: 1rem 2rem;
              border-radius: 8px;
              font-size: ${data.width * 0.03}px;
              font-weight: bold;
              border: none;
              cursor: pointer;
              text-align: center;
              max-width: 80%;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          <div class="ad-container">
            ${data.image_url ? `<img src="${data.image_url}" class="background-image" />` : ''}
            <div class="overlay"></div>
            <div class="content">
              ${data.headline ? `<h1 class="headline">${data.headline}</h1>` : ''}
              ${data.cta_text ? `<button class="cta-button">${data.cta_text}</button>` : ''}
            </div>
          </div>
        </body>
      </html>
    `;

    // Set content and wait for fonts to load
    await page.setContent(html);
    await page.evaluateHandle('document.fonts.ready');

    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality: 90,
      fullPage: true
    });

    await browser.close();

    console.log('Successfully generated ad image');

    return new Response(screenshot, { 
      headers: { 
        ...corsHeaders,
        'Content-Type': 'image/jpeg'
      } 
    });

  } catch (error) {
    console.error('Error generating ad:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});