import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the user making the request is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Edge Function: Unauthorized - No Authorization header.');
      return new Response(JSON.stringify({ error: 'Unauthorized: No Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authUser) {
      console.error('Edge Function: Auth error:', authError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('Edge Function: Admin user authenticated:', authUser.id);

    // Fetch the profile of the authenticated user to check their role and get their organization_id
    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, organization_id')
      .eq('id', authUser.id)
      .single();

    if (profileError || !adminProfile || adminProfile.role !== 'Administrador') {
      console.error('Edge Function: Profile error or not admin:', profileError?.message, adminProfile?.role);
      return new Response(JSON.stringify({ error: 'Forbidden: Only administrators can create sub-users.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('Edge Function: Requesting user is an Administrator with organization_id:', adminProfile.organization_id);

    const { email, password, first_name, last_name, role, crmv } = await req.json(); // Adicionado crmv
    console.log('Edge Function: Received payload for new sub-user:', { email, first_name, last_name, role, crmv });


    if (!email || !password || !first_name || !last_name || !role) {
      console.error('Edge Function: Missing required fields in payload.');
      return new Response(JSON.stringify({ error: 'Missing required fields: email, password, first_name, last_name, role' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // IMPORTANT: Prevent creating a sub-user with 'Administrador' role
    if (role === 'Administrador') {
      console.error('Edge Function: Forbidden - Attempt to create sub-user with Administrator role.');
      return new Response(JSON.stringify({ error: 'Forbidden: Cannot create a sub-user with Administrator role.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create the new user
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Automatically confirm email for admin-created users
      user_metadata: {
        first_name,
        last_name,
        role,
        crmv: crmv || null, // Adicionado crmv
        organization_id: adminProfile.organization_id, // Pass the admin's organization_id
      },
    });

    if (createUserError) {
      console.error('Edge Function: Error creating user in auth.users:', createUserError.message);
      return new Response(JSON.stringify({ error: createUserError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('Edge Function: Sub-user created successfully in auth.users with ID:', newUser.user?.id);

    return new Response(JSON.stringify({ message: 'Sub-user created successfully', userId: newUser.user?.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Edge Function: Unhandled error:', error.message);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});