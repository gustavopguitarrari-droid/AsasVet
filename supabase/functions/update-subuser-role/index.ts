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

    // Fetch the profile of the authenticated user to check their role
    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single();

    if (profileError || !adminProfile || adminProfile.role !== 'Administrador') {
      console.error('Profile error or not admin:', profileError?.message, adminProfile?.role);
      return new Response(JSON.stringify({ error: 'Forbidden: Only administrators can update sub-user roles.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { userIdToUpdate, newRole } = await req.json();

    if (!userIdToUpdate || !newRole) {
      return new Response(JSON.stringify({ error: 'Missing required fields: userIdToUpdate, newRole' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prevent an admin from changing their own role via this function (they can do it via profile settings)
    if (userIdToUpdate === authUser.id) {
      return new Response(JSON.stringify({ error: 'Forbidden: An administrator cannot change their own role via this interface.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // NEW CHECK: Verify if the target profile exists
    const { data: targetProfile, error: targetProfileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userIdToUpdate)
      .single();

    if (targetProfileError || !targetProfile) {
      console.error('Target profile not found or error fetching:', targetProfileError?.message);
      return new Response(JSON.stringify({ error: 'Target user profile not found.' }), {
        status: 404, // Not Found
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // END NEW CHECK

    // Update the role in the profiles table
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userIdToUpdate);

    if (updateProfileError) {
      console.error('Error updating profile role:', updateProfileError.message);
      return new Response(JSON.stringify({ error: updateProfileError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Also update the user_metadata in auth.users for consistency
    const { error: updateAuthUserError } = await supabaseAdmin.auth.admin.updateUser(
      userIdToUpdate,
      { user_metadata: { role: newRole } }
    );

    if (updateAuthUserError) {
      console.error('Error updating auth.users metadata:', updateAuthUserError.message);
      // This is a non-critical error, but we should log it.
      // We can still return success if the profile table update was successful.
    }

    return new Response(JSON.stringify({ message: 'Sub-user role updated successfully' }), {
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