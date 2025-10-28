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
      return new Response(JSON.stringify({ error: 'Unauthorized: No Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authUser) {
      console.error('Auth error:', authError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch the profile of the authenticated user to check their role and get their organization_id
    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, organization_id')
      .eq('id', authUser.id)
      .single();

    if (profileError || !adminProfile || adminProfile.role !== 'Administrador') {
      console.error('Profile error or not admin:', profileError?.message, adminProfile?.role);
      return new Response(JSON.stringify({ error: 'Forbidden: Only administrators can delete sub-users.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { userIdToDelete } = await req.json();

    if (!userIdToDelete) {
      return new Response(JSON.stringify({ error: 'Missing required field: userIdToDelete' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prevent an admin from deleting themselves
    if (userIdToDelete === authUser.id) {
      return new Response(JSON.stringify({ error: 'Forbidden: An administrator cannot delete their own account.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Ensure the target user belongs to the same organization as the admin
    const { data: targetProfile, error: targetProfileError } = await supabaseAdmin
      .from('profiles')
      .select('organization_id')
      .eq('id', userIdToDelete)
      .single();

    if (targetProfileError || !targetProfile || targetProfile.organization_id !== adminProfile.organization_id) {
      console.error('Target user not found or not in the same organization:', targetProfileError?.message);
      return new Response(JSON.stringify({ error: 'Forbidden: Target user not found or does not belong to your organization.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete the user
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);

    if (deleteUserError) {
      console.error('Error deleting user:', deleteUserError.message);
      return new Response(JSON.stringify({ error: deleteUserError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Sub-user deleted successfully' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unhandled error:', error.message);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});