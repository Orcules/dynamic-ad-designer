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

// Style application functions with enhanced designs
async function applyMinimalStyle(ctx: any, ad: any) {
  // Create semi-transparent overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.fillRect(0, ad.height - 200, ad.width, 200)
  
  // Add headline with shadow
  ctx.font = '48px Arial'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#000000'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
  ctx.shadowBlur = 10
  ctx.fillText(ad.headline, ad.width / 2, ad.height - 120)
  
  // Add CTA button
  const btnWidth = 200
  const btnHeight = 50
  const btnX = (ad.width - btnWidth) / 2
  const btnY = ad.height - 80
  
  // Button shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
  ctx.shadowBlur = 15
  ctx.fillStyle = '#4A90E2'
  ctx.fillRect(btnX, btnY, btnWidth, btnHeight)
  
  // Button text
  ctx.shadowBlur = 0
  ctx.font = '24px Arial'
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(ad.cta_text, ad.width / 2, btnY + 35)
}

async function applyModernStyle(ctx: any, ad: any) {
  // Create gradient overlay
  const gradient = ctx.createLinearGradient(0, 0, 0, ad.height)
  gradient.addColorStop(0, 'rgba(66, 134, 244, 0.3)')
  gradient.addColorStop(1, 'rgba(66, 134, 244, 0.8)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, ad.width, ad.height)
  
  // Add headline with modern font
  ctx.font = 'bold 56px Arial'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 20
  ctx.fillText(ad.headline, ad.width / 2, ad.height - 100)
  
  // Add modern CTA button
  const btnWidth = 220
  const btnHeight = 60
  const btnX = (ad.width - btnWidth) / 2
  const btnY = ad.height - 90
  
  // Button with gradient
  const btnGradient = ctx.createLinearGradient(btnX, btnY, btnX + btnWidth, btnY + btnHeight)
  btnGradient.addColorStop(0, '#FF4B2B')
  btnGradient.addColorStop(1, '#FF416C')
  ctx.fillStyle = btnGradient
  
  // Rounded rectangle function
  roundRect(ctx, btnX, btnY, btnWidth, btnHeight, 30)
  
  // Button text
  ctx.font = 'bold 24px Arial'
  ctx.fillStyle = '#FFFFFF'
  ctx.shadowBlur = 0
  ctx.fillText(ad.cta_text, ad.width / 2, btnY + 40)
}

async function applyBoldStyle(ctx: any, ad: any) {
  // Create dramatic gradient overlay
  const gradient = ctx.createLinearGradient(0, 0, ad.width, ad.height)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, ad.width, ad.height)
  
  // Add bold headline with stroke
  ctx.font = 'bold 72px Arial'
  ctx.textAlign = 'center'
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 3
  ctx.strokeText(ad.headline, ad.width / 2, ad.height - 120)
  ctx.fillStyle = '#FF5722'
  ctx.fillText(ad.headline, ad.width / 2, ad.height - 120)
  
  // Add dramatic CTA button
  const btnWidth = 250
  const btnHeight = 70
  const btnX = (ad.width - btnWidth) / 2
  const btnY = ad.height - 100
  
  // Button with glow effect
  ctx.shadowColor = '#FF5722'
  ctx.shadowBlur = 30
  ctx.fillStyle = '#FFFFFF'
  roundRect(ctx, btnX, btnY, btnWidth, btnHeight, 35)
  
  // Button text
  ctx.font = 'bold 28px Arial'
  ctx.fillStyle = '#000000'
  ctx.shadowBlur = 0
  ctx.fillText(ad.cta_text, ad.width / 2, btnY + 45)
}

async function applyElegantStyle(ctx: any, ad: any) {
  // Create subtle gradient overlay
  const gradient = ctx.createLinearGradient(0, 0, 0, ad.height)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, ad.width, ad.height)
  
  // Add elegant headline
  ctx.font = 'italic 54px Georgia'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#FFFFFF'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
  ctx.shadowBlur = 15
  ctx.fillText(ad.headline, ad.width / 2, ad.height - 100)
  
  // Add elegant CTA button
  const btnWidth = 220
  const btnHeight = 60
  const btnX = (ad.width - btnWidth) / 2
  const btnY = ad.height - 90
  
  // Button with subtle gradient
  const btnGradient = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnHeight)
  btnGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
  btnGradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)')
  ctx.fillStyle = btnGradient
  
  // Rounded rectangle with border
  ctx.shadowBlur = 20
  roundRect(ctx, btnX, btnY, btnWidth, btnHeight, 30)
  
  // Button text
  ctx.font = '24px Georgia'
  ctx.fillStyle = '#000000'
  ctx.shadowBlur = 0
  ctx.fillText(ad.cta_text, ad.width / 2, btnY + 40)
}

// Helper function for drawing rounded rectangles
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