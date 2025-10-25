import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Edge Function: Request received for update-subuser-role.'); // Added log

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Edge Function: update-subuser-role started within try block.'); // Added log
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('Edge Function: Unauthorized - No Authorization header.');
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

    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single();

    if (profileError || !adminProfile || adminProfile.role !== 'Administrador') {
      console.error('Edge Function: Profile error or not admin:', profileError?.message, adminProfile?.role);
      return new Response(JSON.stringify({ error: 'Forbidden: Only administrators can update sub-user roles.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('Edge Function: Requesting user is an Administrator.');

    const { userIdToUpdate, newRole } = await req.json();
    console.log('Edge Function: Received payload - userIdToUpdate:', userIdToUpdate, 'newRole:', newRole);

    if (!userIdToUpdate || !newRole) {
      console.log('Edge Function: Bad Request - Missing required fields.');
      return new Response(JSON.stringify({ error: 'Missing required fields: userIdToUpdate, newRole' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (userIdToUpdate === authUser.id) {
      console.log('Edge Function: Forbidden - Admin trying to change own role.');
      return new Response(JSON.stringify({ error: 'Forbidden: An administrator cannot change their own role via this interface.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: targetProfile, error: targetProfileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userIdToUpdate)
      .single();

    if (targetProfileError || !targetProfile) {
      console.error('Edge Function: Target profile not found or error fetching:', targetProfileError?.message);
      return new Response(JSON.stringify({ error: 'Target user profile not found.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('Edge Function: Target profile found:', userIdToUpdate);

    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userIdToUpdate);

    if (updateProfileError) {
      console.error('Edge Function: Error updating profile role in public.profiles:', updateProfileError.message);
      return new Response(JSON.stringify({ error: `Failed to update profile role: ${updateProfileError.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('Edge Function: Profile role updated in public.profiles.');

    const { error: updateAuthUserError } = await supabaseAdmin.auth.admin.updateUser(
      userIdToUpdate,
      { user_metadata: { role: newRole } }
    );

    if (updateAuthUserError) {
      console.error('Edge Function: Error updating auth.users metadata:', updateAuthUserError); // Log the full error object
      return new Response(JSON.stringify({ error: `Failed to update user metadata: ${updateAuthUserError.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('Edge Function: User metadata updated in auth.users.');

    console.log('Edge Function: Sub-user role updated successfully. Returning 200 OK.');
    return new Response(JSON.stringify({ message: 'Sub-user role updated successfully' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Edge Function: Unhandled error in catch block:', error); // Improved log
    // Ensure consistent JSON error response with correct status and headers
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});