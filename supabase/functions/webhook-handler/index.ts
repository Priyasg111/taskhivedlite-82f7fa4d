
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") as string;
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") as string;
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Get the signature from the header
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "No stripe signature found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the raw body
    const body = await req.text();
    
    // Construct the event
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      
      // Initialize Supabase admin client
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      
      // Add credits to user account
      if (session.metadata?.userId && session.metadata?.credits) {
        const userId = session.metadata.userId;
        const credits = parseInt(session.metadata.credits, 10);
        
        // First, get the user's current credits
        const { data: userProfile, error: profileError } = await supabaseAdmin
          .from("user_profiles")
          .select("credits")
          .eq("id", userId)
          .single();
        
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          return new Response(JSON.stringify({ error: "Error fetching user profile" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        const currentCredits = userProfile?.credits || 0;
        const newCredits = currentCredits + credits;
        
        // Update the credits
        const { error: updateError } = await supabaseAdmin
          .from("user_profiles")
          .update({ credits: newCredits })
          .eq("id", userId);
          
        if (updateError) {
          console.error("Error updating credits:", updateError);
          return new Response(JSON.stringify({ error: "Error updating credits" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        // Record the transaction
        const { error: transactionError } = await supabaseAdmin
          .from("transactions")
          .insert({
            user_id: userId,
            role: "employer",
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency ? session.currency.toUpperCase() : "USD",
            type: "deposit",
            status: "completed",
            payment_method: "stripe",
            description: "Added credits via Stripe",
            metadata: {
              credits: credits,
              stripe_session_id: session.id,
              stripe_payment_intent: session.payment_intent
            }
          });
          
        if (transactionError) {
          console.error("Error recording transaction:", transactionError);
          return new Response(JSON.stringify({ error: "Error recording transaction" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
