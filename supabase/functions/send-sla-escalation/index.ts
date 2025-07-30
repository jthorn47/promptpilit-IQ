import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EscalationRequest {
  caseId: string;
  employeeName: string;
  issueCategory: string;
  clientName: string;
  hoursSinceActivity: number;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { caseId, employeeName, issueCategory, clientName, hoursSinceActivity }: EscalationRequest = await req.json();

    if (!caseId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: caseId' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`SLA ESCALATION: Case ${caseId} has been unaddressed for ${hoursSinceActivity} hours`);

    // Create system notification for admins
    const escalationMessage = `⚠️ SLA BREACH: Case ${caseId} for ${employeeName} (${clientName}) has been open for ${Math.round(hoursSinceActivity)} hours without updates. Issue: ${issueCategory}`;

    // Log the escalation in sms_logs as a system event
    const { error: logError } = await supabaseClient
      .from('sms_logs')
      .insert({
        conversation_id: caseId,
        direction: 'system',
        message_body: escalationMessage,
        from_number: 'SYSTEM',
        to_number: 'ADMIN',
        message_type: 'sla_escalation'
      });

    if (logError) {
      console.error('Error logging SLA escalation:', logError);
    }

    // Get admin users for notification
    const { data: adminUsers, error: adminError } = await supabaseClient
      .from('user_roles')
      .select('user_id, profiles!inner(email)')
      .in('role', ['super_admin', 'company_admin']);

    if (adminError) {
      console.error('Error fetching admin users:', adminError);
    }

    // Send email notifications to admins (if email service is configured)
    if (adminUsers && adminUsers.length > 0) {
      for (const admin of adminUsers) {
        try {
          const emailResponse = await supabaseClient.functions.invoke('send-email', {
            body: {
              to: admin.profiles.email,
              subject: '⚠️ SLA Breach Alert - Immediate Action Required',
              html: `
                <h2>🚨 SLA Breach Alert</h2>
                <p><strong>Case ID:</strong> ${caseId}</p>
                <p><strong>Employee:</strong> ${employeeName}</p>
                <p><strong>Client:</strong> ${clientName}</p>
                <p><strong>Issue Category:</strong> ${issueCategory}</p>
                <p><strong>Hours Since Last Activity:</strong> ${Math.round(hoursSinceActivity)}</p>
                <br>
                <p style="color: red; font-weight: bold;">This case has exceeded the 48-hour SLA threshold and requires immediate attention.</p>
                <p><a href="${Deno.env.get('SUPABASE_URL')}/pulse/cases/${caseId}" style="background: #ff4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Case →</a></p>
              `
            }
          });

          if (emailResponse.error) {
            console.error(`Failed to send escalation email to ${admin.profiles.email}:`, emailResponse.error);
          } else {
            console.log(`Escalation email sent to ${admin.profiles.email}`);
          }
        } catch (error) {
          console.error(`Error sending escalation email to admin:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'SLA escalation processed successfully',
        notifiedAdmins: adminUsers?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-sla-escalation function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process SLA escalation', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});