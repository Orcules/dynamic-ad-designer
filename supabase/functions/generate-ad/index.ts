import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { id } = await req.json();

    // Get the ad details
    const { data: ad, error: adError } = await supabase
      .from('generated_ads')
      .select('*')
      .eq('id', id)
      .single();

    if (adError) throw adError;

    // Generate image using DALL-E
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Create a ${ad.template_style} style advertisement for ${ad.platform}. The ad should be professional and modern, incorporating the headline: "${ad.headline}"`,
        n: 1,
        size: `${ad.width}x${ad.height}`,
      }),
    });

    const imageData = await imageResponse.json();
    
    if (!imageData.data?.[0]?.url) {
      throw new Error('Failed to generate image');
    }

    // Update the ad with the generated image URL
    const { error: updateError } = await supabase
      .from('generated_ads')
      .update({ 
        image_url: imageData.data[0].url,
        status: 'completed'
      })
      .eq('id', id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating ad:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});