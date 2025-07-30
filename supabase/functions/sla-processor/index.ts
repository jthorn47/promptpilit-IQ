import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('SLA Processor: Starting SLA check...');

    // Step 1: Update SLA statuses
    const { error: slaUpdateError } = await supabaseClient.rpc('check_sla_violations');
    if (slaUpdateError) {
      console.error('Error updating SLA statuses:', slaUpdateError);
      throw new Error(`SLA update failed: ${slaUpdateError.message}`);
    }

    // Step 2: Get cases needing 24h follow-up
    const { data: followUpCases, error: followUpError } = await supabaseClient.rpc('get_cases_needing_followup');
    if (followUpError) {
      console.error('Error getting follow-up cases:', followUpError);
    } else if (followUpCases && followUpCases.length > 0) {
      console.log(`Found ${followUpCases.length} cases needing follow-up`);
      
      // Send follow-up SMS for each case
      for (const caseData of followUpCases) {
        try {
          const followUpResponse = await supabaseClient.functions.invoke('send-sla-followup', {
            body: {
              caseId: caseData.case_id,
              phoneNumber: caseData.phone_number,
              employeeName: caseData.employee_name,
              issueCategory: caseData.issue_category
            }
          });

          if (followUpResponse.error) {
            console.error(`Failed to send follow-up for case ${caseData.case_id}:`, followUpResponse.error);
          } else {
            console.log(`Follow-up sent for case ${caseData.case_id}`);
            
            // Mark follow-up as sent
            await supabaseClient
              .from('pulse_cases')
              .update({ follow_up_sent_at: new Date().toISOString() })
              .eq('id', caseData.case_id);
          }
        } catch (error) {
          console.error(`Error sending follow-up for case ${caseData.case_id}:`, error);
        }
      }
    }

    // Step 3: Get cases needing 48h escalation
    const { data: escalationCases, error: escalationError } = await supabaseClient.rpc('get_cases_needing_escalation');
    if (escalationError) {
      console.error('Error getting escalation cases:', escalationError);
    } else if (escalationCases && escalationCases.length > 0) {
      console.log(`Found ${escalationCases.length} cases needing escalation`);
      
      // Send escalation notifications
      for (const caseData of escalationCases) {
        try {
          const escalationResponse = await supabaseClient.functions.invoke('send-sla-escalation', {
            body: {
              caseId: caseData.case_id,
              employeeName: caseData.employee_name,
              issueCategory: caseData.issue_category,
              clientName: caseData.client_name,
              hoursSinceActivity: caseData.hours_since_activity
            }
          });

          if (escalationResponse.error) {
            console.error(`Failed to send escalation for case ${caseData.case_id}:`, escalationResponse.error);
          } else {
            console.log(`Escalation sent for case ${caseData.case_id}`);
            
            // Mark escalation as sent
            await supabaseClient
              .from('pulse_cases')
              .update({ escalation_sent_at: new Date().toISOString() })
              .eq('id', caseData.case_id);
          }
        } catch (error) {
          console.error(`Error sending escalation for case ${caseData.case_id}:`, error);
        }
      }
    }

    console.log('SLA Processor: Completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'SLA processing completed',
        followUpsSent: followUpCases?.length || 0,
        escalationsSent: escalationCases?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in SLA processor:', error);
    return new Response(
      JSON.stringify({ error: 'SLA processing failed', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});