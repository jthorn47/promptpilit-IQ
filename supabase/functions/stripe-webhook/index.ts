import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Webhook received");

    // Get the raw body and signature
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("No stripe signature found");
      return new Response("No signature", { status: 400 });
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeSecretKey || !webhookSecret) {
      console.error("Missing Stripe configuration");
      return new Response("Configuration error", { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(`Verified webhook event: ${event.type}`);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response("Invalid signature", { status: 400 });
    }

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Processing payment_intent.succeeded: ${paymentIntent.id}`);

        // Get customer info
        let customerEmail = null;
        if (paymentIntent.customer) {
          try {
            const customer = await stripe.customers.retrieve(paymentIntent.customer as string);
            customerEmail = (customer as Stripe.Customer).email;
          } catch (error) {
            console.error("Error fetching customer:", error);
          }
        }

        // Get customer name and email
        const customerName = paymentIntent.charges?.data[0]?.billing_details?.name || 'Unknown Customer';
        const amount = paymentIntent.amount / 100; // Convert from cents
        
        // Store one-time payment
        const { error: paymentError } = await supabaseClient
          .from("one_time_payments")
          .upsert({
            stripe_payment_intent_id: paymentIntent.id,
            stripe_customer_id: paymentIntent.customer as string || null,
            amount: amount,
            status: paymentIntent.status,
            employee_count: 1, // Default value, could be extracted from metadata
            created_at: new Date(paymentIntent.created * 1000).toISOString(),
          }, { 
            onConflict: 'stripe_payment_intent_id',
            ignoreDuplicates: false 
          });

        if (paymentError) {
          console.error("Error storing payment:", paymentError);
        } else {
          console.log("One-time payment stored successfully");
        }

        // Check for duplicates first
        const { data: duplicateCheck } = await supabaseClient
          .rpc('check_duplicate_company_client', {
            p_company_name: customerName,
            p_email: customerEmail
          });

        console.log('Duplicate check result:', duplicateCheck);

        // Check if client already exists
        const { data: existingClient } = await supabaseClient
          .from('clients')
          .select('id, source')
          .eq('company_name', customerName)
          .maybeSingle();

        if (!existingClient) {
          // Check if company exists and migrate to client
          const { data: existingCompany } = await supabaseClient
            .from('company_settings')
            .select('id, lifecycle_stage')
            .eq('company_name', customerName)
            .maybeSingle();

          if (existingCompany && existingCompany.lifecycle_stage !== 'client') {
            // Migrate company to client
            const { data: newClientId, error: migrationError } = await supabaseClient
              .rpc('migrate_company_to_client', {
                p_company_id: existingCompany.id,
                p_source: 'eCommerce',
                p_deal_id: null,
                p_converted_by: null
              });

            if (migrationError) {
              console.error('Error migrating company to client:', migrationError);
            } else {
              console.log('Company migrated to client successfully:', newClientId);
            }
          } else {
            // Create new client directly (eCommerce flow)
            const { error: clientError } = await supabaseClient
              .from('clients')
              .insert({
                company_name: customerName,
                source: 'eCommerce',
                date_won: new Date().toISOString(),
                contract_value: amount,
                currency: paymentIntent.currency.toUpperCase(),
                status: 'active',
                onboarding_status: 'pending',
                key_contacts: [{ 
                  name: customerName, 
                  email: customerEmail || 'unknown@email.com', 
                  role: 'Primary Contact' 
                }],
                services_purchased: ['LMS'], // Default for eCommerce
                plan_type: 'basic'
              });

            if (clientError) {
              console.error('Error creating client:', clientError);
            } else {
              console.log('New eCommerce client created successfully');
            }
          }
        } else {
          console.log('Client already exists, updating payment info');
        }

        // Send admin notification email
        try {
          await supabaseClient.functions.invoke('send-email', {
            body: {
              to: 'admin@easeworks.com',
              subject: `🎉 New Purchase: ${customerName} - $${amount}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #655DC6;">🎉 New Purchase Notification</h2>
                  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
                    <p><strong>Customer:</strong> ${customerName}</p>
                    <p><strong>Email:</strong> ${customerEmail || 'Not provided'}</p>
                    <p><strong>Amount:</strong> $${amount} ${paymentIntent.currency.toUpperCase()}</p>
                    <p><strong>Payment ID:</strong> ${paymentIntent.id}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                  </div>
                  <p style="margin-top: 20px;">The customer has been automatically added to your Active Clients list.</p>
                </div>
              `
            }
          });
          console.log('Admin notification email sent successfully');
        } catch (emailError) {
          console.error('Error sending admin notification email:', emailError);
        }

        // Send customer confirmation email
        if (customerEmail) {
          try {
            await supabaseClient.functions.invoke('send-email', {
              body: {
                to: customerEmail,
                subject: `Purchase Confirmation - Thank you ${customerName}!`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #655DC6;">Thank you for your purchase!</h2>
                    <p>Hi ${customerName},</p>
                    <p>We've successfully processed your payment. Here are the details:</p>
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p><strong>Amount Paid:</strong> $${amount} ${paymentIntent.currency.toUpperCase()}</p>
                      <p><strong>Payment ID:</strong> ${paymentIntent.id}</p>
                      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    <p>If you have any questions about your purchase, please don't hesitate to contact us.</p>
                    <p>Best regards,<br>The EaseWorks Team</p>
                  </div>
                `
              }
            });
            console.log('Customer confirmation email sent successfully');
          } catch (emailError) {
            console.error('Error sending customer confirmation email:', emailError);
          }
        }

        // Check if this is an SB553 plan purchase and trigger workflow
        const isSB553Plan = paymentIntent.description?.toLowerCase().includes('sb553') || 
                           paymentIntent.description?.toLowerCase().includes('sb 553') ||
                           paymentIntent.description?.toLowerCase().includes('workplace violence');
        
        if (isSB553Plan && customerEmail) {
          // Trigger SB553 workflow
          try {
            await supabaseClient.functions.invoke('workflow-engine', {
              body: {
                trigger_type: 'purchase',
                trigger_value: 'SB553-PLAN',
                context_data: {
                  customer_email: customerEmail,
                  customer_name: customerName,
                  company_name: customerName,
                  amount: amount,
                  payment_intent_id: paymentIntent.id
                }
              }
            });
            console.log('SB553 workflow triggered successfully');
          } catch (workflowError) {
            console.error('Error triggering SB553 workflow:', workflowError);
          }
        }

        // Legacy: Check if this is a double PV plan wizard purchase  
        const isDoublePVPlan = paymentIntent.description?.toLowerCase().includes('double pv plan') || 
                              paymentIntent.description?.toLowerCase().includes('plan wizard');
        
        if (isDoublePVPlan && customerEmail && !isSB553Plan) {
          try {
            await supabaseClient.functions.invoke('send-email', {
              body: {
                to: customerEmail,
                subject: `Your Double PV Plan Wizard - ${customerName}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #655DC6;">Your Double PV Plan Wizard</h2>
                    <p>Hi ${customerName},</p>
                    <p>Thank you for purchasing the Double PV Plan Wizard! Your customized plan is attached.</p>
                    <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #655DC6;">
                      <h3 style="margin-top: 0;">What's Next:</h3>
                      <ul>
                        <li>Review your customized PV plan</li>
                        <li>Follow the implementation steps outlined</li>
                        <li>Contact us if you have any questions</li>
                      </ul>
                    </div>
                    <p>We're here to support you on your journey!</p>
                    <p>Best regards,<br>The EaseWorks Team</p>
                  </div>
                `
              }
            });
            console.log('Double PV plan email sent successfully');
          } catch (emailError) {
            console.error('Error sending double PV plan email:', emailError);
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Processing invoice.payment_succeeded: ${invoice.id}`);

        if (invoice.subscription) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          
          // Get customer info
          let customerEmail = null;
          if (invoice.customer) {
            try {
              const customer = await stripe.customers.retrieve(invoice.customer as string);
              customerEmail = (customer as Stripe.Customer).email;
            } catch (error) {
              console.error("Error fetching customer:", error);
            }
          }

          // Update subscription payment status
          const { error: subError } = await supabaseClient
            .from("subscriptions")
            .upsert({
              stripe_subscription_id: subscription.id,
              stripe_customer_id: subscription.customer as string,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              employee_count: 1, // Default value, could be extracted from metadata
              updated_at: new Date().toISOString(),
            }, { 
              onConflict: 'stripe_subscription_id',
              ignoreDuplicates: false 
            });

          if (subError) {
            console.error("Error updating subscription:", subError);
          } else {
            console.log("Subscription payment recorded successfully");
          }
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Processing customer.subscription.created: ${subscription.id}`);

        // Get customer info
        let customerEmail = null;
        try {
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          customerEmail = (customer as Stripe.Customer).email;
        } catch (error) {
          console.error("Error fetching customer:", error);
        }

        const { error: subError } = await supabaseClient
          .from("subscriptions")
          .upsert({
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            employee_count: 1, // Default value
            created_at: new Date(subscription.created * 1000).toISOString(),
          }, { 
            onConflict: 'stripe_subscription_id',
            ignoreDuplicates: false 
          });

        if (subError) {
          console.error("Error creating subscription:", subError);
        } else {
          console.log("Subscription created successfully");
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Processing customer.subscription.updated: ${subscription.id}`);

        const { error: subError } = await supabaseClient
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (subError) {
          console.error("Error updating subscription:", subError);
        } else {
          console.log("Subscription updated successfully");
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Processing customer.subscription.deleted: ${subscription.id}`);

        const { error: subError } = await supabaseClient
          .from("subscriptions")
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (subError) {
          console.error("Error canceling subscription:", subError);
        } else {
          console.log("Subscription canceled successfully");
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});