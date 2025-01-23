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

    // Create semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(0, 0, ad.width, ad.height)

    if (ad.headline) {
      // Set up text properties
      const fontSize = Math.floor(ad.width * 0.08) // Responsive font size
      ctx.font = `bold ${fontSize}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Create gradient for headline
      const gradient = ctx.createLinearGradient(0, ad.height * 0.3, ad.width, ad.height * 0.3)
      
      // Parse accent color
      const accentColor = ad.accent_color || '#4A90E2'
      
      // Add gradient stops based on template style
      if (ad.template_style === 'modern') {
        gradient.addColorStop(0, adjustColor(accentColor, 30))
        gradient.addColorStop(0.5, accentColor)
        gradient.addColorStop(1, adjustColor(accentColor, -30))
      } else if (ad.template_style === 'bold') {
        gradient.addColorStop(0, accentColor)
        gradient.addColorStop(1, adjustColor(accentColor, 20))
      } else if (ad.template_style === 'elegant') {
        gradient.addColorStop(0, accentColor)
        gradient.addColorStop(1, adjustColor(accentColor, 30))
      } else {
        // minimal style
        gradient.addColorStop(0, accentColor)
        gradient.addColorStop(1, accentColor)
      }

      ctx.fillStyle = gradient
      
      // Draw headline with word wrap
      const words = ad.headline.split(' ')
      const lines = []
      let currentLine = words[0]

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i]
        const metrics = ctx.measureText(testLine)
        if (metrics.width < ad.width * 0.8) {
          currentLine = testLine
        } else {
          lines.push(currentLine)
          currentLine = words[i]
        }
      }
      lines.push(currentLine)

      // Calculate total height of text block
      const lineHeight = fontSize * 1.2
      const totalHeight = lines.length * lineHeight
      let startY = (ad.height * 0.4) - (totalHeight / 2)

      // Draw each line
      lines.forEach((line, index) => {
        const y = startY + (index * lineHeight)
        ctx.fillText(line, ad.width / 2, y)
      })
    }

    if (ad.cta_text) {
      // Button dimensions and position
      const btnWidth = Math.min(300, ad.width * 0.6)
      const btnHeight = ad.height * 0.12
      const btnX = (ad.width - btnWidth) / 2
      const btnY = ad.height * 0.7

      // Create button gradient
      const btnGradient = ctx.createLinearGradient(btnX, btnY, btnX + btnWidth, btnY + btnHeight)
      
      if (ad.template_style === 'modern' || ad.template_style === 'bold') {
        btnGradient.addColorStop(0, adjustColor(ad.accent_color, 20))
        btnGradient.addColorStop(1, ad.accent_color)
      } else {
        btnGradient.addColorStop(0, ad.accent_color)
        btnGradient.addColorStop(1, ad.accent_color)
      }

      // Draw button background
      ctx.fillStyle = btnGradient
      roundRect(ctx, btnX, btnY, btnWidth, btnHeight, btnHeight / 2)

      // Draw button text
      const btnFontSize = Math.floor(btnHeight * 0.4)
      ctx.font = `bold ${btnFontSize}px Arial`
      ctx.fillStyle = '#FFFFFF'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(ad.cta_text, ad.width / 2, btnY + (btnHeight / 2))
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

function adjustColor(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1)}`
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