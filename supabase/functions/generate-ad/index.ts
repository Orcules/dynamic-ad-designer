import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get form data
    const formData = await req.formData();
    const data = JSON.parse(formData.get('data') as string);
    const image = formData.get('image') as File;

    // Upload image if provided
    let imageUrl = null;
    if (image) {
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('ad-images')
        .upload(`${Date.now()}-${image.name}`, image);

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase
        .storage
        .from('ad-images')
        .getPublicUrl(uploadData.path);
        
      imageUrl = publicUrl;
    }

    // Create ad record
    const { data: adData, error: adError } = await supabase
      .from('generated_ads')
      .insert({
        name: data.Name,
        width: data.W,
        height: data.H,
        headline: data['TR-Text'],
        cta_text: data['BT-Text'],
        image_url: imageUrl,
        font_url: data['TR-Font'],
      })
      .select()
      .single();

    if (adError) throw adError;

    return new Response(
      JSON.stringify({ success: true, data: adData }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in generate-ad function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});