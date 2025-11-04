import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@16.2.0?target=deno";
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
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      return new Response(JSON.stringify({ error: 'Missing Stripe signature or webhook secret' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.text();
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const userId = checkoutSession.metadata?.user_id;
        const customerId = checkoutSession.customer as string;
        const subscriptionId = checkoutSession.subscription as string;

        if (!userId || !customerId || !subscriptionId) {
          console.error('Missing metadata in checkout.session.completed event:', checkoutSession);
          return new Response(JSON.stringify({ error: 'Missing metadata in checkout session' }), { status: 400 });
        }

        // Fetch subscription details to get the plan name
        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ['items.data.price.product'],
        });
        const productName = (subscription.items.data[0].price?.product as Stripe.Product)?.name;

        if (!productName) {
          console.error('Could not retrieve product name from subscription:', subscription);
          return new Response(JSON.stringify({ error: 'Could not retrieve product name' }), { status: 500 });
        }

        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan_name: productName,
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating user profile:', updateError);
          return new Response(JSON.stringify({ error: 'Failed to update user profile' }), { status: 500 });
        }
        console.log(`User ${userId} subscribed to ${productName} (Subscription ID: ${subscriptionId})`);
        break;
      // Handle other event types as needed (e.g., 'customer.subscription.updated', 'customer.subscription.deleted')
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Stripe Webhook Error:', error.message);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});