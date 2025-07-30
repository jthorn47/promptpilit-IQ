import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertTrigger {
  type: 'task_reminder' | 'deal_inactivity' | 'proposal_engagement' | 'high_risk_score';
  entityId: string;
  recipientEmail: string;
  recipientName?: string;
  metadata?: any;
}

const logActivity = async (type: string, entityType: string, entityId: string, description: string, performedBy?: string) => {
  try {
    await supabase.from('crm_activity_log').insert({
      activity_type: type,
      entity_type: entityType,
      entity_id: entityId,
      description,
      performed_by: performedBy,
      performed_by_type: 'system',
      source: 'automated_alert'
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

const generateTaskReminderEmail = async (taskId: string, recipientEmail: string) => {
  const { data: task } = await supabase
    .from('crm_tasks')
    .select(`
      id, title, description, due_date, priority, status,
      crm_companies!inner(name),
      assigned_to_user:user_profiles!inner(first_name, last_name)
    `)
    .eq('id', taskId)
    .single();

  if (!task) throw new Error('Task not found');

  const isOverdue = new Date(task.due_date) < new Date();
  const dueText = isOverdue ? 'OVERDUE' : 'due in 24 hours';
  const urgencyClass = isOverdue ? 'color: #dc2626;' : 'color: #ea580c;';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
        <h1>Task Reminder</h1>
      </div>
      
      <div style="padding: 30px; background: #f9fafb;">
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="${urgencyClass} margin-top: 0;">${task.title}</h2>
          <p style="font-size: 16px; margin: 15px 0;">This task is <strong>${dueText}</strong>.</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Company:</strong> ${task.crm_companies.name}</p>
            <p><strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
            ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.easeworks.com/crm/tasks/${task.id}" 
               style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
               View Task in CRM
            </a>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
        <p>ConnectIQ CRM - Keeping you on track</p>
      </div>
    </div>
  `;

  return {
    subject: `Task Reminder: ${task.title}`,
    html,
    metadata: { taskId, companyName: task.crm_companies.name }
  };
};

const generateDealInactivityEmail = async (opportunityId: string, recipientEmail: string) => {
  const { data: opportunity } = await supabase
    .from('crm_opportunities')
    .select(`
      id, title, stage, last_activity_date,
      crm_companies!inner(name),
      assigned_to_user:user_profiles!inner(first_name, last_name)
    `)
    .eq('id', opportunityId)
    .single();

  if (!opportunity) throw new Error('Opportunity not found');

  const daysSinceActivity = Math.floor(
    (new Date().getTime() - new Date(opportunity.last_activity_date).getTime()) / (1000 * 60 * 60 * 24)
  );

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
        <h1>Deal Activity Alert</h1>
      </div>
      
      <div style="padding: 30px; background: #f9fafb;">
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #dc2626; margin-top: 0;">No activity on ${opportunity.crm_companies.name}</h2>
          <p style="font-size: 16px;">This opportunity has been inactive for <strong>${daysSinceActivity} days</strong>.</p>
          
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p><strong>Opportunity:</strong> ${opportunity.title}</p>
            <p><strong>Stage:</strong> ${opportunity.stage}</p>
            <p><strong>Last Activity:</strong> ${new Date(opportunity.last_activity_date).toLocaleDateString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.easeworks.com/crm/opportunities/${opportunity.id}/follow-up" 
               style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
               Create Follow-up Task
            </a>
            <a href="https://app.easeworks.com/crm/opportunities/${opportunity.id}" 
               style="background: #374151; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
               View Opportunity
            </a>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
        <p>ConnectIQ CRM - Stay proactive with your deals</p>
      </div>
    </div>
  `;

  return {
    subject: `No activity on ${opportunity.crm_companies.name} in ${daysSinceActivity} days`,
    html,
    metadata: { opportunityId, companyName: opportunity.crm_companies.name, daysSinceActivity }
  };
};

const generateProposalEngagementEmail = async (proposalId: string, recipientEmail: string, engagementType: 'viewed' | 'not_opened') => {
  const { data: proposal } = await supabase
    .from('crm_proposals')
    .select(`
      id, title, created_at,
      crm_opportunities!inner(
        id, title,
        crm_companies!inner(name)
      )
    `)
    .eq('id', proposalId)
    .single();

  if (!proposal) throw new Error('Proposal not found');

  const isViewed = engagementType === 'viewed';
  const bgColor = isViewed ? '#059669' : '#dc2626';
  const companyName = proposal.crm_opportunities.crm_companies.name;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${bgColor}; color: white; padding: 20px; text-align: center;">
        <h1>Proposal ${isViewed ? 'Engagement' : 'Alert'}</h1>
      </div>
      
      <div style="padding: 30px; background: #f9fafb;">
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          ${isViewed ? 
            `<h2 style="color: #059669; margin-top: 0;">${companyName} viewed your proposal!</h2>
             <p style="font-size: 16px;">Great news! Your proposal has been opened and is being reviewed.</p>` :
            `<h2 style="color: #dc2626; margin-top: 0;">Proposal to ${companyName} not opened</h2>
             <p style="font-size: 16px;">Your proposal hasn't been opened in 48 hours. Consider following up.</p>`
          }
          
          <div style="background: ${isViewed ? '#ecfdf5' : '#fef2f2'}; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Proposal:</strong> ${proposal.title}</p>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Sent:</strong> ${new Date(proposal.created_at).toLocaleDateString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.easeworks.com/crm/proposals/${proposal.id}" 
               style="background: ${bgColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
               View Proposal
            </a>
            ${!isViewed ? 
              `<a href="https://app.easeworks.com/crm/opportunities/${proposal.crm_opportunities.id}/follow-up" 
                 style="background: #374151; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                 Follow Up
              </a>` : ''
            }
          </div>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
        <p>ConnectIQ CRM - Track your proposal engagement</p>
      </div>
    </div>
  `;

  return {
    subject: isViewed ? `${companyName} viewed your proposal` : `Proposal to ${companyName} not opened in 48 hours`,
    html,
    metadata: { proposalId, companyName, engagementType }
  };
};

const generateHighRiskScoreEmail = async (assessmentId: string, recipientEmail: string) => {
  const { data: assessment } = await supabase
    .from('crm_risk_assessments')
    .select(`
      id, risk_score, assessment_data,
      crm_opportunities!inner(
        id, title,
        crm_companies!inner(name)
      )
    `)
    .eq('id', assessmentId)
    .single();

  if (!assessment) throw new Error('Risk assessment not found');

  const companyName = assessment.crm_opportunities.crm_companies.name;
  const riskScore = assessment.risk_score;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
        <h1>High Risk Score Alert</h1>
      </div>
      
      <div style="padding: 30px; background: #f9fafb;">
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #dc2626; margin-top: 0;">High Risk Score on ${companyName}</h2>
          <p style="font-size: 16px;">This opportunity has a risk score of <strong>${riskScore}</strong> and requires immediate attention.</p>
          
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Opportunity:</strong> ${assessment.crm_opportunities.title}</p>
            <p><strong>Risk Score:</strong> ${riskScore}/100</p>
          </div>
          
          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p><strong>Recommended Actions:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Send a proposal immediately</li>
              <li>Schedule a consultation call</li>
              <li>Review and update SPIN data</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.easeworks.com/crm/propgen/${assessment.crm_opportunities.id}" 
               style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
               Create Proposal
            </a>
            <a href="https://app.easeworks.com/crm/opportunities/${assessment.crm_opportunities.id}" 
               style="background: #374151; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
               View Opportunity
            </a>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
        <p>ConnectIQ CRM - Proactive risk management</p>
      </div>
    </div>
  `;

  return {
    subject: `High Risk Score on ${companyName}`,
    html,
    metadata: { assessmentId, companyName, riskScore }
  };
};

const sendAlert = async (trigger: AlertTrigger) => {
  let emailData;

  switch (trigger.type) {
    case 'task_reminder':
      emailData = await generateTaskReminderEmail(trigger.entityId, trigger.recipientEmail);
      break;
    case 'deal_inactivity':
      emailData = await generateDealInactivityEmail(trigger.entityId, trigger.recipientEmail);
      break;
    case 'proposal_engagement':
      emailData = await generateProposalEngagementEmail(trigger.entityId, trigger.recipientEmail, trigger.metadata?.engagementType);
      break;
    case 'high_risk_score':
      emailData = await generateHighRiskScoreEmail(trigger.entityId, trigger.recipientEmail);
      break;
    default:
      throw new Error(`Unknown alert type: ${trigger.type}`);
  }

  // Send email
  const emailResponse = await resend.emails.send({
    from: "ConnectIQ CRM <noreply@easeworks.com>",
    to: [trigger.recipientEmail],
    subject: emailData.subject,
    html: emailData.html,
  });

  // Log the notification
  await logActivity(
    'notification',
    trigger.type === 'task_reminder' ? 'crm_tasks' : 
    trigger.type === 'deal_inactivity' ? 'crm_opportunities' :
    trigger.type === 'proposal_engagement' ? 'crm_proposals' : 'crm_risk_assessments',
    trigger.entityId,
    `Email alert sent: ${emailData.subject}`,
    'system'
  );

  return emailResponse;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const trigger: AlertTrigger = await req.json();
    console.log(`📧 Processing CRM alert: ${trigger.type} for ${trigger.recipientEmail}`);

    const result = await sendAlert(trigger);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: result.data?.id,
      type: trigger.type 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in crm-alerts function:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);