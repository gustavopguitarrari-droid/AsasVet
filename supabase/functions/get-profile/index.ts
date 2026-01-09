import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the ANON key.
    // The user's auth token will be forwarded from the request headers.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // The getUser() call will now validate the token and return the user object
    // based on the forwarded Authorization header.
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      console.error('Auth error in get-profile function:', authError?.message)
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch the user's profile from the profiles table.
    // This will now be subject to RLS policies.
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      // Handle case where profile might not exist yet without throwing a 500
      if (profileError.code === 'PGRST116') { // 'PGRST116' means no rows found
        return new Response(JSON.stringify(null), {
          status: 200, // Not an error, just no profile
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      console.error('Profile fetch error in get-profile function:', profileError.message)
      throw profileError
    }

    // Return the profile data
    return new Response(JSON.stringify(profile), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Unhandled error in get-profile function:', error.message)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})