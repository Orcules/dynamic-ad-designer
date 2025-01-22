import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Canvas } from 'https://deno.land/x/canvas/mod.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { id } = await req.json()

    // Get the ad details
    const { data: ad, error: fetchError } = await supabase
      .from('generated_ads')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // Create canvas with the specified dimensions
    const canvas = new Canvas(ad.width, ad.height)
    const ctx = canvas.getContext('2d')

    // Load and draw the background image
    const image = await loadImage(ad.image_url!)
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

    // Upload the generated image to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ad-images')
      .upload(`generated/${ad.id}.png`, buffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Get public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('ad-images')
      .getPublicUrl(`generated/${ad.id}.png`)

    // Update the ad with the generated image URL
    const { error: updateError } = await supabase
      .from('generated_ads')
      .update({ 
        image_url: publicUrl,
        status: 'completed'
      })
      .eq('id', id)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Helper functions for different styles
async function applyMinimalStyle(ctx: any, ad: any) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.fillRect(0, ad.height - 200, ad.width, 200)
  
  ctx.font = '48px Arial'
  ctx.fillStyle = '#000000'
  ctx.textAlign = 'center'
  ctx.fillText(ad.headline, ad.width / 2, ad.height - 120)
  
  ctx.font = '24px Arial'
  ctx.fillStyle = '#666666'
  ctx.fillText(ad.cta_text, ad.width / 2, ad.height - 60)
}

async function applyModernStyle(ctx: any, ad: any) {
  // Gradient overlay
  const gradient = ctx.createLinearGradient(0, 0, 0, ad.height)
  gradient.addColorStop(0, 'rgba(0,0,0,0)')
  gradient.addColorStop(1, 'rgba(0,0,0,0.7)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, ad.width, ad.height)
  
  ctx.font = 'bold 56px Arial'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.fillText(ad.headline, ad.width / 2, ad.height - 100)
  
  // Modern CTA button
  const btnWidth = 200
  const btnHeight = 50
  const btnX = (ad.width - btnWidth) / 2
  const btnY = ad.height - 80
  
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(btnX, btnY, btnWidth, btnHeight)
  
  ctx.font = 'bold 24px Arial'
  ctx.fillStyle = '#000000'
  ctx.fillText(ad.cta_text, ad.width / 2, btnY + 35)
}

async function applyBoldStyle(ctx: any, ad: any) {
  // Bold colored overlay
  ctx.fillStyle = 'rgba(255, 87, 34, 0.2)'
  ctx.fillRect(0, 0, ad.width, ad.height)
  
  // Large bold headline
  ctx.font = 'bold 72px Arial'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.strokeText(ad.headline, ad.width / 2, ad.height - 120)
  ctx.fillText(ad.headline, ad.width / 2, ad.height - 120)
  
  // Bold CTA
  ctx.font = 'bold 36px Arial'
  ctx.fillStyle = '#FF5722'
  ctx.fillText(ad.cta_text, ad.width / 2, ad.height - 50)
}

async function applyElegantStyle(ctx: any, ad: any) {
  // Elegant vignette effect
  const gradient = ctx.createRadialGradient(
    ad.width/2, ad.height/2, 0,
    ad.width/2, ad.height/2, ad.width/2
  )
  gradient.addColorStop(0, 'rgba(0,0,0,0)')
  gradient.addColorStop(1, 'rgba(0,0,0,0.4)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, ad.width, ad.height)
  
  // Elegant serif font for headline
  ctx.font = 'italic 54px Georgia'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.fillText(ad.headline, ad.width / 2, ad.height - 100)
  
  // Elegant CTA
  ctx.font = '28px Georgia'
  ctx.fillText(ad.cta_text, ad.width / 2, ad.height - 40)
}

async function loadImage(url: string): Promise<any> {
  const response = await fetch(url)
  const blob = await response.blob()
  const imageBitmap = await createImageBitmap(blob)
  return imageBitmap
}