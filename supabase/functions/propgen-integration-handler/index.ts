import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PropGENTriggerRequest {
  triggerType: string;
  companyId: string;
  triggerData: any;
  userId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { triggerType, companyId, triggerData, userId }: PropGENTriggerRequest = await req.json();

    console.log(`Processing PropGEN trigger: ${triggerType} for company: ${companyId}`);

    // Process the trigger based on type
    let result = {};
    switch (triggerType) {
      case 'risk_assessment_completed':
        result = await handleRiskAssessmentCompleted(supabase, companyId, triggerData);
        break;
      case 'spin_content_generated':
        result = await handleSpinContentGenerated(supabase, companyId, triggerData, userId);
        break;
      case 'investment_analysis_saved':
        result = await handleInvestmentAnalysisSaved(supabase, companyId, triggerData, userId);
        break;
      case 'proposal_generated':
        result = await handleProposalGenerated(supabase, companyId, triggerData, userId);
        break;
      case 'proposal_sent':
        result = await handleProposalSent(supabase, companyId, triggerData, userId);
        break;
      default:
        throw new Error(`Unknown trigger type: ${triggerType}`);
    }

    // Find active integration webhooks for this trigger type
    const { data: webhooks, error: webhookError } = await supabase
      .from('integration_webhooks')
      .select('*')
      .eq('is_active', true)
      .contains('trigger_events', [triggerType]);

    if (webhookError) {
      console.error('Error fetching webhooks:', webhookError);
    }

    // Send notifications to configured webhooks
    const webhookResults = [];
    if (webhooks && webhooks.length > 0) {
      for (const webhook of webhooks) {
        try {
          const webhookResult = await sendWebhookNotification(webhook, {
            event_type: triggerType,
            company_id: companyId,
            trigger_data: triggerData,
            result: result,
            timestamp: new Date().toISOString()
          });
          webhookResults.push({ webhook_id: webhook.id, success: true, result: webhookResult });
        } catch (error) {
          console.error(`Error sending webhook ${webhook.id}:`, error);
          webhookResults.push({ webhook_id: webhook.id, success: false, error: error.message });
        }
      }
    }

    // Log the audit trail
    await logPropGENAudit(supabase, {
      companyId,
      triggerType,
      triggerData,
      actionType: 'trigger_processed',
      actionResult: { ...result, webhooks_sent: webhookResults.length },
      performedBy: userId
    });

    return new Response(JSON.stringify({ 
      success: true, 
      result,
      webhooks_notified: webhookResults.length,
      webhook_results: webhookResults
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in propgen-integration-handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

async function handleRiskAssessmentCompleted(supabase: any, companyId: string, triggerData: any) {
  console.log('Handling risk assessment completion:', { companyId, triggerData });
  
  // Update company settings
  await supabase
    .from('company_settings')
    .update({
      current_risk_score: triggerData.risk_score,
      last_assessment_date: triggerData.assessment_date,
      propgen_status: 'risk_assessment_completed',
      propgen_updated_at: new Date().toISOString()
    })
    .eq('id', companyId);

  // Trigger SPIN content generation
  const spinResult = await supabase.functions.invoke('generate-spin-content', {
    body: {
      companyId,
      riskData: triggerData
    }
  });

  return {
    riskAssessmentProcessed: true,
    riskScoreUpdated: true,
    spinGenerationTriggered: !!spinResult.data,
    investmentAnalysisActivated: true
  };
}

async function handleSpinContentGenerated(supabase: any, companyId: string, triggerData: any, userId?: string) {
  console.log('Handling SPIN content generation:', { companyId, triggerData });
  
  // Update PropGEN workflow
  const { error } = await supabase
    .from('propgen_workflows')
    .upsert({
      company_id: companyId,
      workflow_status: 'spin_generated',
      spin_content_status: 'draft_generated',
      spin_content: triggerData.spinContent,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'company_id'
    });

  if (error) {
    throw new Error(`Failed to update workflow: ${error.message}`);
  }

  return {
    spinContentSaved: true,
    workflowUpdated: true,
    status: 'draft_generated'
  };
}

async function handleInvestmentAnalysisSaved(supabase: any, companyId: string, triggerData: any, userId?: string) {
  console.log('Handling investment analysis save:', { companyId, triggerData });
  
  // Update PropGEN workflow
  const { error } = await supabase
    .from('propgen_workflows')
    .upsert({
      company_id: companyId,
      workflow_status: 'investment_analysis_completed',
      investment_analysis_status: 'completed',
      investment_analysis_data: triggerData,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'company_id'
    });

  if (error) {
    throw new Error(`Failed to update workflow: ${error.message}`);
  }

  return {
    investmentAnalysisSaved: true,
    proposalDraftUnlocked: true,
    workflowUpdated: true
  };
}

async function handleProposalGenerated(supabase: any, companyId: string, triggerData: any, userId?: string) {
  console.log('Handling proposal generation:', { companyId, triggerData });
  
  // Create proposal approval request
  const { data: approvalData, error: approvalError } = await supabase
    .from('proposal_approvals')
    .insert({
      company_id: companyId,
      submitted_by: userId,
      status: 'pending',
      proposal_data: triggerData,
      risk_score: triggerData.riskScore,
      investment_analysis: triggerData.investmentAnalysis
    })
    .select()
    .single();

  if (approvalError) {
    throw new Error(`Failed to create approval request: ${approvalError.message}`);
  }

  // Send approval notification email
  const emailResult = await supabase.functions.invoke('send-proposal-approval-notification', {
    body: {
      companyId,
      approvalId: approvalData.id,
      proposalData: triggerData
    }
  });

  return {
    proposalGenerated: true,
    approvalRequested: true,
    approvalId: approvalData.id,
    emailSent: !!emailResult.data,
    status: 'pending_approval'
  };
}

async function handleProposalSent(supabase: any, companyId: string, triggerData: any, userId?: string) {
  console.log('Handling proposal sent:', { companyId, triggerData });
  
  // Update PropGEN workflow
  const { error } = await supabase
    .from('propgen_workflows')
    .upsert({
      company_id: companyId,
      workflow_status: 'proposal_sent',
      proposal_status: 'sent',
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'company_id'
    });

  if (error) {
    throw new Error(`Failed to update workflow: ${error.message}`);
  }

  return {
    proposalSent: true,
    recipient: triggerData.recipient,
    sentAt: new Date().toISOString(),
    workflowCompleted: true
  };
}

async function sendWebhookNotification(webhook: any, payload: any) {
  const response = await fetch(webhook.webhook_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook failed with status: ${response.status}`);
  }

  return await response.json().catch(() => ({ status: 'sent' }));
}

async function logPropGENAudit(supabase: any, auditData: any) {
  const { error } = await supabase
    .from('propgen_audit_logs')
    .insert({
      company_id: auditData.companyId,
      trigger_type: auditData.triggerType,
      trigger_data: auditData.triggerData,
      action_type: auditData.actionType,
      action_result: auditData.actionResult,
      performed_by: auditData.performedBy,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Failed to log PropGEN audit:', error);
  }
}

serve(handler);