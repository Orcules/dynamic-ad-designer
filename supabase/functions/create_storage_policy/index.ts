
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const bucketName = 'ad-images'

    // שלב 1: בדיקה האם הבקט קיים וליצור אותו אם לא
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      throw new Error(`Failed to list buckets: ${bucketsError.message}`)
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
    
    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketName}`)
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760 // 10MB limit
      })
      
      if (createError) {
        throw new Error(`Failed to create bucket: ${createError.message}`)
      }
      console.log(`Bucket created successfully: ${bucketName}`)
    }

    // שלב 2: הפעלת פונקציית הSQL ליצירת פוליסות
    console.log('Creating storage policies...')
    const { error: policyError } = await supabase.rpc('create_storage_policy', { bucket_name: bucketName })
    
    if (policyError) {
      throw new Error(`Failed to create policies: ${policyError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Storage bucket "${bucketName}" and policies created/verified successfully`
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error(`Error: ${error.message}`)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 500,
      }
    )
  }
})
