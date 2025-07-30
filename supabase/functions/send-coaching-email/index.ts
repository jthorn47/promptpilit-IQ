import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, digest } = await req.json();

    // Get user email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('user_id', user_id)
      .single();

    if (profileError || !profile) {
      throw new Error('User not found');
    }

    // Generate email HTML
    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">🎯 Your Weekly AI Coaching Digest</h1>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>📊 Pipeline Summary</h2>
            <ul>
              <li><strong>${digest.pipeline_summary.active_deals}</strong> active deals worth <strong>$${digest.pipeline_summary.total_value.toLocaleString()}</strong></li>
              <li><strong>${digest.pipeline_summary.won_this_week}</strong> deals won this week</li>
              <li><strong>${digest.pipeline_summary.response_rate}%</strong> response rate</li>
            </ul>
          </div>

          ${digest.attention_needed.length > 0 ? `
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>⚠️ Deals Needing Attention</h2>
            <ul>
              ${digest.attention_needed.map(deal => `
                <li><strong>${deal.deal_name}</strong> - ${deal.reason} (${deal.days_since_contact} days since contact)</li>
              `).join('')}
            </ul>
          </div>
          ` : ''}

          ${digest.patterns.length > 0 ? `
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>🧠 Your Success Patterns</h2>
            <ul>
              ${digest.patterns.map(pattern => `
                <li><strong>${pattern.insight}</strong><br><em>${pattern.impact}</em> (${pattern.confidence}% confidence)</li>
              `).join('')}
            </ul>
          </div>
          ` : ''}

          ${digest.suggested_actions.length > 0 ? `
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>🎯 Suggested Actions This Week</h2>
            <ul>
              ${digest.suggested_actions.map(action => `
                <li><strong>${action.action}</strong>${action.deal_name ? ` (${action.deal_name})` : ''}<br><em>${action.expected_outcome}</em></li>
              `).join('')}
            </ul>
          </div>
          ` : ''}

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Generated on ${new Date(digest.generated_at).toLocaleDateString()}<br>
            Keep up the great work! 🚀
          </p>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "AI Coach <noreply@yourdomain.com>",
      to: [profile.email],
      subject: "🎯 Your Weekly AI Coaching Digest",
      html: emailHtml,
    });

    console.log("Coaching digest email sent to:", profile.email);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending coaching digest email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});