
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    console.log('Forwarding request to Supabase Edge Function');
    
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
      console.error('Error response from Edge Function:', response.status, response.statusText);
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate ad');
    }

    const data = await response.json();
    return Response.json(data);
    
  } catch (error: any) {
    console.error('Error in generate-ad API:', error);
    return Response.json(
      { error: error.message || 'Failed to generate ad' }, 
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
