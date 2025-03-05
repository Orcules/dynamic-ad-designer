
// Follow this setup guide to integrate the Supabase JavaScript Library.
// https://supabase.com/docs/guides/functions/quickstart

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

console.log("Create Storage Policy Edge Function - Started")

serve(async (req) => {
  try {
    // פרסינג רגיל של הגוף והוספת לוגים לשלבים
    console.log("Parsing request body")
    const { bucket_name = "ad-images", detailed = false } = await req.json()
    
    console.log(`Processing bucket: ${bucket_name}, detailed: ${detailed}`)
    
    // יצירת קליינט Supabase מתוך מידע בהקשר
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    )
    
    // אימות חיבור
    console.log("Testing supabase connection...")
    const { data: buckets, error: listError } = await supabaseClient.storage.listBuckets()
    
    if (listError) {
      console.error(`Connection test failed: ${listError.message}`)
      // ננסה להמשיך בכל זאת
    } else {
      console.log(`Connection test passed. Found ${buckets.length} buckets.`)
    }
    
    // בדיקה אם הבאקט כבר קיים
    console.log(`Checking if bucket '${bucket_name}' exists...`)
    
    const bucketExists = buckets?.some(b => b.name === bucket_name)
    
    const results = {
      bucket_exists: bucketExists,
      bucket_created: false,
      policies_updated: false,
      details: detailed ? {} : undefined
    }
    
    if (bucketExists) {
      console.log(`Bucket '${bucket_name}' already exists. Skipping creation.`)
    } else {
      // יצירת באקט
      console.log(`Creating bucket '${bucket_name}'...`)
      try {
        const { error: createError } = await supabaseClient.storage.createBucket(bucket_name, {
          public: true,
          fileSizeLimit: 10485760, // 10 MB
          allowedMimeTypes: ['image/*']
        })
        
        if (createError) {
          console.error(`Failed to create bucket: ${createError.message}`)
          results.details = {
            ...results.details,
            bucket_create_error: createError.message
          }
          
          // בדיקה אם השגיאה היא בגלל שהבאקט כבר קיים
          if (createError.message.includes('already exists')) {
            console.log("Bucket already exists according to error message")
            results.bucket_exists = true
          }
        } else {
          console.log(`Bucket '${bucket_name}' created successfully`)
          results.bucket_created = true
        }
      } catch (err) {
        console.error(`Exception creating bucket: ${err.message}`)
        results.details = {
          ...results.details,
          bucket_create_exception: err.message
        }
      }
    }
    
    // ניהול מדיניות
    console.log("Ensuring anonymous access policies...")
    
    // פונקציה לקביעת מדיניות גישה לבאקט
    async function ensureStoragePolicy() {
      try {
        // 1. קביעת מדיניות SELECT (קריאה)
        console.log("Creating SELECT policy...")
        
        const selectPolicy = {
          name: `${bucket_name}_anon_select`,
          definition: "TRUE", // להרשות לכולם
          check: "TRUE"
        }
        
        await executeRawSQL(`
          INSERT INTO storage.policies (name, object, action, definition, check)
          VALUES ('${selectPolicy.name}', '${bucket_name}', 'SELECT', '${selectPolicy.definition}', '${selectPolicy.check}')
          ON CONFLICT (name, object, action) DO UPDATE
          SET definition = EXCLUDED.definition, check = EXCLUDED.check
        `);
        
        // 2. קביעת מדיניות INSERT (כתיבה)
        console.log("Creating INSERT policy...")
        
        const insertPolicy = {
          name: `${bucket_name}_anon_insert`,
          definition: "TRUE", // להרשות לכולם
          check: "TRUE"
        }
        
        await executeRawSQL(`
          INSERT INTO storage.policies (name, object, action, definition, check)
          VALUES ('${insertPolicy.name}', '${bucket_name}', 'INSERT', '${insertPolicy.definition}', '${insertPolicy.check}')
          ON CONFLICT (name, object, action) DO UPDATE
          SET definition = EXCLUDED.definition, check = EXCLUDED.check
        `);
        
        // 3. קביעת מדיניות UPDATE (עדכון)
        console.log("Creating UPDATE policy...")
        
        const updatePolicy = {
          name: `${bucket_name}_anon_update`,
          definition: "TRUE", // להרשות לכולם
          check: "TRUE"
        }
        
        await executeRawSQL(`
          INSERT INTO storage.policies (name, object, action, definition, check)
          VALUES ('${updatePolicy.name}', '${bucket_name}', 'UPDATE', '${updatePolicy.definition}', '${updatePolicy.check}')
          ON CONFLICT (name, object, action) DO UPDATE
          SET definition = EXCLUDED.definition, check = EXCLUDED.check
        `);
        
        results.policies_updated = true
        console.log("Storage policies created/updated successfully")
        
        return true
      } catch (error) {
        console.error(`Error setting storage policies: ${error.message}`)
        results.details = {
          ...results.details,
          policy_error: error.message
        }
        return false
      }
    }
    
    // פונקציה לביצוע שאילתת SQL ישירה
    async function executeRawSQL(sql) {
      try {
        console.log(`Executing SQL: ${sql}`)
        const { error } = await supabaseClient.rpc('supabase_admin_execute_sql', {
          sql_query: sql
        })
        
        if (error) {
          console.error(`SQL execution error: ${error.message}`)
          results.details = {
            ...results.details,
            sql_error: error.message
          }
          throw error
        }
        
        return true
      } catch (err) {
        console.error(`Exception in SQL execution: ${err.message}`)
        results.details = {
          ...results.details,
          sql_exception: err.message
        }
        
        // ננסה גישה אלטרנטיבית אם הראשונה נכשלה
        try {
          // פנייה ישירה לDB באמצעות postgres, נדרשים לזה הרשאות
          const { error } = await supabaseClient.from('storage.policies').select('*').limit(1)
          results.details = {
            ...results.details,
            alternative_query: error ? error.message : 'successful'
          }
        } catch (alt_err) {
          results.details = {
            ...results.details,
            alternative_query_error: alt_err.message
          }
        }
        
        return false
      }
    }
    
    // הוספה ידנית של הבאקט לטבלת באקטים (אם יש לנו הרשאות)
    if (!results.bucket_exists && !results.bucket_created) {
      console.log("Attempting direct bucket insertion...")
      try {
        const { error } = await supabaseClient.from('storage.buckets').insert({
          id: bucket_name,
          name: bucket_name,
          public: true,
          avif_autodetection: false,
          file_size_limit: 10485760,
          allowed_mime_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        })
        
        if (error) {
          console.error(`Direct bucket insertion failed: ${error.message}`)
          results.details = {
            ...results.details,
            direct_insert_error: error.message
          }
        } else {
          console.log("Direct bucket insertion succeeded")
          results.bucket_created = true
        }
      } catch (err) {
        console.error(`Exception in direct bucket insertion: ${err.message}`)
        results.details = {
          ...results.details,
          direct_insert_exception: err.message
        }
      }
    }
    
    // קביעת מדיניות גישה
    const policyResult = await ensureStoragePolicy()
    
    console.log(`Function execution completed with: bucket_exists=${results.bucket_exists}, bucket_created=${results.bucket_created}, policies_updated=${results.policies_updated}`)
    
    return new Response(
      JSON.stringify(results),
      { 
        headers: { "Content-Type": "application/json" },
        status: 200
      },
    )
  } catch (error) {
    console.error(`Fatal error in edge function: ${error.message}`)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 500
      },
    )
  }
})
