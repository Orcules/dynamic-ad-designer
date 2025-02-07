
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Forward the request to the Supabase Edge Function
    const response = await fetch(
      'https://mmzlufnvxzqdkreatybs.supabase.co/functions/v1/generate-ad',
      {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate ad');
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in generate-ad API:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate ad' }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
