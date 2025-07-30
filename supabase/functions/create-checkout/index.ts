import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      packageId, 
      employeeCount, 
      isThreeYear = false, 
      pricePerUser,
      totalPrice,
      packageName,
      paymentType = 'subscription' // 'subscription' or 'payment'
    } = await req.json();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get user from request
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user?.email) {
      throw new Error("User not authenticated");
    }

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId = customers.data[0]?.id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    let sessionConfig: any;

    if (paymentType === 'payment') {
      // One-time payment
      sessionConfig = {
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${packageName} - One-time Purchase`,
                description: `Workplace Safety Training Package for ${employeeCount} employees`,
                images: [`${req.headers.get("origin")}/checkout-banner.png`],
              },
              unit_amount: Math.round(totalPrice * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
      };
    } else {
      // Subscription (annual billing)
      const interval = isThreeYear ? "year" : "year";
      const intervalCount = isThreeYear ? 3 : 1;
      
      sessionConfig = {
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${packageName} - ${isThreeYear ? '3-Year' : 'Annual'} Subscription`,
                description: `Workplace Safety Training Package for ${employeeCount} employees`,
                images: [`${req.headers.get("origin")}/checkout-banner.png`],
              },
              unit_amount: Math.round((totalPrice / (isThreeYear ? 3 : 1)) * 100), // Annual price in cents
              recurring: {
                interval: interval,
                interval_count: intervalCount,
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
      };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      ...sessionConfig,
      success_url: `${req.headers.get("origin")}/admin/my-learning?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
      metadata: {
        user_id: user.id,
        package_id: packageId,
        employee_count: employeeCount.toString(),
        is_three_year: isThreeYear.toString(),
        payment_type: paymentType,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});