import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Canvas, loadImage, createCanvas } from "https://deno.land/x/canvas/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { id } = await req.json()
    console.log('Processing ad with ID:', id)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: ad, error: fetchError } = await supabase
      .from('generated_ads')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching ad:', fetchError)
      throw fetchError
    }

    console.log('Ad details:', ad)

    const canvas = createCanvas(ad.width, ad.height)
    const ctx = canvas.getContext('2d')

    // Load and draw the background image
    const image = await loadImage(ad.image_url)
    ctx.drawImage(image, 0, 0, ad.width, ad.height)

    // Apply style based on template_style
    switch (ad.template_style) {
      case 'minimal':
        await applyMinimalStyle(ctx, ad)
        break
      case 'modern':
        await applyModernStyle(ctx, ad)
        break
      case 'bold':
        await applyBoldStyle(ctx, ad)
        break
      case 'elegant':
        await applyElegantStyle(ctx, ad)
        break
      default:
        await applyMinimalStyle(ctx, ad)
    }

    // Convert canvas to buffer
    const buffer = canvas.toBuffer()

    // Upload the generated image
    const filePath = `generated/${id}.png`
    const { error: uploadError } = await supabase.storage
      .from('ad-images')
      .upload(filePath, buffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading generated image:', uploadError)
      throw uploadError
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('ad-images')
      .getPublicUrl(filePath)

    // Update the ad with the generated image URL
    const { error: updateError } = await supabase
      .from('generated_ads')
      .update({ 
        image_url: publicUrl,
        status: 'completed'
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating ad:', updateError)
      throw updateError
    }

    return new Response(
      JSON.stringify({ success: true, imageUrl: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-ad function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function createGradient(ctx: any, x: number, y: number, width: number, height: number, color1: string, color2: string) {
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
}

function adjustColor(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1)}`;
}

async function applyMinimalStyle(ctx: any, ad: any) {
  if (ad.headline) {
    // Set up text style
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.fillStyle = ad.accent_color
    ctx.fillText(ad.headline, ad.width / 2, ad.height - 120)
  }
  
  if (ad.cta_text) {
    // Draw button
    const btnWidth = Math.min(200, ad.width * 0.8)
    const btnHeight = 50
    const btnX = (ad.width - btnWidth) / 2
    const btnY = ad.height - 80
    
    ctx.fillStyle = ad.accent_color
    roundRect(ctx, btnX, btnY, btnWidth, btnHeight, 25)
    
    // Button text
    ctx.font = '24px Arial'
    ctx.fillStyle = '#FFFFFF'
    const textMetrics = ctx.measureText(ad.cta_text)
    const textX = ad.width / 2
    const textY = btnY + (btnHeight / 2) + (textMetrics.actualBoundingBoxAscent / 2)
    ctx.fillText(ad.cta_text, textX, textY)
  }
}

async function applyModernStyle(ctx: any, ad: any) {
  if (ad.headline) {
    // Create gradient for headline
    const gradient = createGradient(
      ctx,
      0,
      ad.height - 160,
      ad.width,
      80,
      adjustColor(ad.accent_color, 30),
      adjustColor(ad.accent_color, -30)
    )
    
    ctx.font = 'bold 56px Arial'
    ctx.textAlign = 'center'
    ctx.fillStyle = gradient
    ctx.fillText(ad.headline, ad.width / 2, ad.height - 100)
  }
  
  if (ad.cta_text) {
    const btnWidth = Math.min(220, ad.width * 0.8)
    const btnHeight = 60
    const btnX = (ad.width - btnWidth) / 2
    const btnY = ad.height - 90
    
    // Create gradient for button
    const btnGradient = createGradient(
      ctx,
      btnX,
      btnY,
      btnWidth,
      btnHeight,
      adjustColor(ad.accent_color, 20),
      ad.accent_color
    )
    
    ctx.fillStyle = btnGradient
    roundRect(ctx, btnX, btnY, btnWidth, btnHeight, 30)
    
    // Button text
    ctx.font = 'bold 24px Arial'
    ctx.fillStyle = '#FFFFFF'
    const textMetrics = ctx.measureText(ad.cta_text)
    const textX = ad.width / 2
    const textY = btnY + (btnHeight / 2) + (textMetrics.actualBoundingBoxAscent / 2)
    ctx.fillText(ad.cta_text, textX, textY)
  }
}

async function applyBoldStyle(ctx: any, ad: any) {
  if (ad.headline) {
    // Create gradient for headline
    const gradient = createGradient(
      ctx,
      0,
      ad.height - 160,
      ad.width,
      80,
      ad.accent_color,
      adjustColor(ad.accent_color, 20)
    )
    
    ctx.font = 'bold 72px Arial'
    ctx.textAlign = 'center'
    ctx.fillStyle = gradient
    ctx.fillText(ad.headline, ad.width / 2, ad.height - 120)
  }
  
  if (ad.cta_text) {
    const btnWidth = Math.min(250, ad.width * 0.8)
    const btnHeight = 70
    const btnX = (ad.width - btnWidth) / 2
    const btnY = ad.height - 100
    
    ctx.fillStyle = '#FFFFFF'
    roundRect(ctx, btnX, btnY, btnWidth, btnHeight, 35)
    
    // Button text
    ctx.font = 'bold 28px Arial'
    ctx.fillStyle = '#000000'
    const textMetrics = ctx.measureText(ad.cta_text)
    const textX = ad.width / 2
    const textY = btnY + (btnHeight / 2) + (textMetrics.actualBoundingBoxAscent / 2)
    ctx.fillText(ad.cta_text, textX, textY)
  }
}

async function applyElegantStyle(ctx: any, ad: any) {
  if (ad.headline) {
    // Create gradient for headline
    const gradient = createGradient(
      ctx,
      0,
      ad.height - 160,
      ad.width,
      80,
      ad.accent_color,
      adjustColor(ad.accent_color, 30)
    )
    
    ctx.font = 'italic 54px Georgia'
    ctx.textAlign = 'center'
    ctx.fillStyle = gradient
    ctx.fillText(ad.headline, ad.width / 2, ad.height - 100)
  }
  
  if (ad.cta_text) {
    const btnWidth = Math.min(220, ad.width * 0.8)
    const btnHeight = 60
    const btnX = (ad.width - btnWidth) / 2
    const btnY = ad.height - 90
    
    // Create gradient for button
    const btnGradient = createGradient(
      ctx,
      btnX,
      btnY,
      btnWidth,
      btnHeight,
      'rgba(255, 255, 255, 0.9)',
      'rgba(255, 255, 255, 0.8)'
    )
    
    ctx.fillStyle = btnGradient
    roundRect(ctx, btnX, btnY, btnWidth, btnHeight, 30)
    
    // Button text
    ctx.font = '24px Georgia'
    ctx.fillStyle = '#000000'
    const textMetrics = ctx.measureText(ad.cta_text)
    const textX = ad.width / 2
    const textY = btnY + (btnHeight / 2) + (textMetrics.actualBoundingBoxAscent / 2)
    ctx.fillText(ad.cta_text, textX, textY)
  }
}

function roundRect(ctx: any, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
  ctx.fill()
}