import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
      return new Response(JSON.stringify({ error: 'Forbidden: Only administrators can update team member profiles.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { userIdToUpdate, first_name, last_name, email, phone, crmv, role } = await req.json();

    if (!userIdToUpdate || !first_name || !last_name || !email || !role) {
      return new Response(JSON.stringify({ error: 'Missing required fields: userIdToUpdate, first_name, last_name, email, role' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prevent an admin from changing their own profile via this function (role changes are handled separately)
    if (userIdToUpdate === authUser.id) {
      return new Response(JSON.stringify({ error: 'Forbidden: An administrator cannot change their own profile via this interface.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Ensure the target user belongs to the same organization as the admin
    const { data: targetProfile, error: targetProfileError } = await supabaseAdmin
      .from('profiles')
      .select('organization_id')
      .eq('id', userIdToUpdate)
      .single();

    if (targetProfileError || !targetProfile || targetProfile.organization_id !== adminProfile.organization_id) {
      console.error('Target user not found or not in the same organization:', targetProfileError?.message);
      return new Response(JSON.stringify({ error: 'Forbidden: Target user not found or does not belong to your organization.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update public.profiles table
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({
        first_name,
        last_name,
        email,
        phone: phone || null, // Allow null for phone
        crmv: crmv || null,   // Allow null for crmv
        role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userIdToUpdate);

    if (updateProfileError) {
      console.error('Error updating profile in public.profiles:', updateProfileError.message);
      return new Response(JSON.stringify({ error: `Failed to update profile: ${updateProfileError.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update auth.users metadata
    const { error: updateAuthUserError } = await supabaseAdmin.auth.admin.updateUserById(
      userIdToUpdate,
      {
        email,
        user_metadata: {
          first_name,
          last_name,
          role,
          organization_id: adminProfile.organization_id, // Ensure organization_id is consistent
        },
      }
    );

    if (updateAuthUserError) {
      console.error('Error updating auth.users metadata:', updateAuthUserError);
      return new Response(JSON.stringify({ error: `Failed to update user metadata: ${updateAuthUserError.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Team member profile updated successfully' }), {
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