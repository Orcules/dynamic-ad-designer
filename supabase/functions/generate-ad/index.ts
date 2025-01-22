import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.1.0";

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get form data
    const formData = await req.formData();
    const data = JSON.parse(formData.get('data') as string);
    const image = formData.get('image') as File;

    // Generate background image using DALL-E if no image was uploaded
    let imageUrl = null;
    if (!image) {
      const configuration = new Configuration({
        apiKey: Deno.env.get('OPENAI_API_KEY'),
      });
      const openai = new OpenAIApi(configuration);

      const prompt = `Create a ${data.template_style} style advertisement background for ${data.platform}. The ad should be ${data.width}x${data.height} pixels.`;
      
      const response = await openai.createImage({
        prompt,
        n: 1,
        size: `${data.width}x${data.height}`,
      });

      imageUrl = response.data.data[0].url;
    } else {
      // Upload the provided image
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
        name: data.name,
        width: data.width,
        height: data.height,
        headline: data.headline,
        cta_text: data.cta_text,
        image_url: imageUrl,
        font_url: data.font_url,
        platform: data.platform,
        template_style: data.template_style,
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