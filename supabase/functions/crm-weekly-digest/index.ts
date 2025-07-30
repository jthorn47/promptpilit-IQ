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

interface WeeklyDigestData {
  userId: string;
  userName: string;
  userEmail: string;
  isAdmin: boolean;
  dateRange: {
    start: string;
    end: string;
  };
}

const getWeeklyMetrics = async (userId: string, isAdmin: boolean, startDate: string, endDate: string) => {
  const baseFilter = isAdmin ? {} : { assigned_to: userId };

  // Get opportunities metrics
  const { data: opportunities } = await supabase
    .from('crm_opportunities')
    .select('id, title, stage, value, close_probability, last_activity_date, created_at')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .match(baseFilter);

  // Get all open opportunities for pipeline value
  const { data: openOpportunities } = await supabase
    .from('crm_opportunities')
    .select('id, value, stage')
    .neq('stage', 'Closed Won')
    .neq('stage', 'Closed Lost')
    .match(baseFilter);

  // Get tasks completed this week
  const { data: completedTasks } = await supabase
    .from('crm_tasks')
    .select('id, title, completed_at')
    .eq('status', 'completed')
    .gte('completed_at', startDate)
    .lte('completed_at', endDate)
    .match(baseFilter);

  // Get overdue tasks
  const { data: overdueTasks } = await supabase
    .from('crm_tasks')
    .select('id, title, due_date, crm_companies!inner(name)')
    .neq('status', 'completed')
    .lt('due_date', new Date().toISOString())
    .match(baseFilter);

  // Get SPIN completion data
  const { data: spinData } = await supabase
    .from('crm_spin_contents')
    .select('id, situation, problem, implication, need_payoff, created_at')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  // Get proposals sent this week
  const { data: proposals } = await supabase
    .from('crm_proposals')
    .select('id, title, status, created_at, crm_opportunities!inner(crm_companies!inner(name))')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  // Get risk assessments with high scores
  const { data: highRiskDeals } = await supabase
    .from('crm_risk_assessments')
    .select(`
      id, risk_score,
      crm_opportunities!inner(
        id, title, last_activity_date,
        crm_companies!inner(name)
      )
    `)
    .gte('risk_score', 70)
    .match(baseFilter);

  // Calculate metrics
  const totalPipelineValue = openOpportunities?.reduce((sum, opp) => sum + (opp.value || 0), 0) || 0;
  const spinCompletionRate = spinData?.length || 0;
  const proposalsSigned = proposals?.filter(p => p.status === 'signed').length || 0;
  
  // Identify deals at risk (inactive + missing SPIN)
  const dealsAtRisk = openOpportunities?.filter(opp => {
    const daysSinceActivity = opp.last_activity_date ? 
      Math.floor((new Date().getTime() - new Date(opp.last_activity_date).getTime()) / (1000 * 60 * 60 * 24)) : 999;
    return daysSinceActivity > 5;
  }) || [];

  return {
    totalOpenOpportunities: openOpportunities?.length || 0,
    totalPipelineValue,
    tasksCompleted: completedTasks?.length || 0,
    spinCompletionRate,
    proposalsSent: proposals?.length || 0,
    proposalsSigned,
    dealsAtRisk: dealsAtRisk.length,
    overdueTasks: overdueTasks?.length || 0,
    highRiskDeals: highRiskDeals?.slice(0, 5) || [],
    recentOpportunities: opportunities?.slice(0, 5) || [],
    overdueTaskDetails: overdueTasks?.slice(0, 5) || []
  };
};

const generateDigestHTML = (data: WeeklyDigestData, metrics: any) => {
  const { userName, isAdmin, dateRange } = data;
  const startDate = new Date(dateRange.start).toLocaleDateString();
  const endDate = new Date(dateRange.end).toLocaleDateString();

  return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #f9fafb;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📊 Your Weekly CRM Briefing</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">${startDate} – ${endDate}</p>
        <p style="margin: 5px 0 0 0; opacity: 0.8;">Hello ${userName}!</p>
      </div>

      <!-- Metrics Overview -->
      <div style="padding: 30px 20px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px;">
          
          <!-- Opportunities Card -->
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #1e40af;">${metrics.totalOpenOpportunities}</div>
            <div style="color: #6b7280; font-size: 14px;">Open Opportunities</div>
          </div>

          <!-- Pipeline Value Card -->
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #059669;">$${(metrics.totalPipelineValue / 1000).toFixed(0)}K</div>
            <div style="color: #6b7280; font-size: 14px;">Pipeline Value</div>
          </div>

          <!-- Tasks Completed Card -->
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #7c3aed;">${metrics.tasksCompleted}</div>
            <div style="color: #6b7280; font-size: 14px;">Tasks Completed</div>
          </div>

          <!-- SPIN Rate Card -->
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #ea580c;">${metrics.spinCompletionRate}</div>
            <div style="color: #6b7280; font-size: 14px;">SPINs Completed</div>
          </div>

        </div>

        <!-- Proposals Section -->
        <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #1f2937; display: flex; align-items: center;">
            📄 Proposals This Week
          </h3>
          <div style="display: flex; gap: 30px;">
            <div>
              <span style="font-size: 24px; font-weight: bold; color: #1e40af;">${metrics.proposalsSent}</span>
              <span style="color: #6b7280; margin-left: 5px;">Sent</span>
            </div>
            <div>
              <span style="font-size: 24px; font-weight: bold; color: #059669;">${metrics.proposalsSigned}</span>
              <span style="color: #6b7280; margin-left: 5px;">Signed</span>
            </div>
          </div>
        </div>

        <!-- Alert Sections -->
        ${metrics.dealsAtRisk > 0 ? `
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #dc2626;">🔥 Deals at Risk</h3>
          <p style="margin: 0; color: #991b1b;">${metrics.dealsAtRisk} deals have been inactive for 5+ days and need attention.</p>
        </div>
        ` : ''}

        ${metrics.overdueTasks > 0 ? `
        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #d97706;">🕒 Overdue Tasks (${metrics.overdueTasks})</h3>
          ${metrics.overdueTaskDetails.map(task => `
            <div style="background: white; padding: 12px; border-radius: 6px; margin: 8px 0; border-left: 3px solid #f59e0b;">
              <div style="font-weight: bold; color: #1f2937;">${task.title}</div>
              <div style="color: #6b7280; font-size: 14px;">Due: ${new Date(task.due_date).toLocaleDateString()}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <!-- High Risk Deals -->
        ${metrics.highRiskDeals.length > 0 ? `
        <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #1f2937;">🚨 High Risk Deals</h3>
          ${metrics.highRiskDeals.map(deal => `
            <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin: 10px 0; border-left: 3px solid #dc2626;">
              <div style="font-weight: bold; color: #1f2937;">${deal.crm_opportunities.crm_companies.name}</div>
              <div style="color: #6b7280; font-size: 14px;">Risk Score: ${deal.risk_score}/100</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <!-- Quick Actions -->
        <div style="text-align: center; margin: 40px 0;">
          <a href="https://app.easeworks.com/crm/dashboard" 
             style="background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 0 10px; font-weight: bold;">
             Open CRM Dashboard
          </a>
          <a href="https://app.easeworks.com/crm/tasks" 
             style="background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 0 10px; font-weight: bold;">
             View Tasks
          </a>
        </div>

        <!-- Tips Section -->
        <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; border-radius: 8px; margin-top: 30px;">
          <h3 style="margin: 0 0 10px 0; color: #0c4a6e;">💡 This Week's Focus</h3>
          <ul style="margin: 10px 0; padding-left: 20px; color: #1e40af;">
            ${metrics.dealsAtRisk > 0 ? '<li>Follow up on inactive deals immediately</li>' : ''}
            ${metrics.overdueTasks > 0 ? '<li>Complete overdue tasks to stay on track</li>' : ''}
            ${metrics.spinCompletionRate < 3 ? '<li>Focus on completing SPIN assessments for better qualification</li>' : ''}
            <li>Keep pipeline moving with consistent follow-ups</li>
            <li>Update opportunity stages after each interaction</li>
          </ul>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 30px 20px; color: #6b7280; background: #f9fafb;">
        <p style="margin: 0;">ConnectIQ CRM - Your weekly performance snapshot</p>
        <p style="margin: 5px 0 0 0; font-size: 14px;">Stay focused, stay successful!</p>
      </div>
    </div>
  `;
};

const sendWeeklyDigest = async (digestData: WeeklyDigestData) => {
  const { userEmail, userName, dateRange } = digestData;
  
  console.log(`📧 Generating weekly digest for ${userName} (${userEmail})`);
  
  const metrics = await getWeeklyMetrics(
    digestData.userId, 
    digestData.isAdmin, 
    dateRange.start, 
    dateRange.end
  );

  const html = generateDigestHTML(digestData, metrics);
  const startDate = new Date(dateRange.start).toLocaleDateString();
  const endDate = new Date(dateRange.end).toLocaleDateString();

  const emailResponse = await resend.emails.send({
    from: "ConnectIQ CRM <noreply@easeworks.com>",
    to: [userEmail],
    subject: `Your Weekly CRM Briefing: ${startDate} – ${endDate}`,
    html,
  });

  // Log the digest
  await supabase.from('crm_activity_log').insert({
    activity_type: 'digest_sent',
    entity_type: 'user',
    entity_id: digestData.userId,
    description: `Weekly CRM digest sent to ${userEmail}`,
    performed_by: 'system',
    performed_by_type: 'system',
    source: 'weekly_digest'
  });

  return emailResponse;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const digestData: WeeklyDigestData = await req.json();
    console.log(`📊 Processing weekly digest for ${digestData.userName}`);

    const result = await sendWeeklyDigest(digestData);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: result.data?.id,
      recipient: digestData.userEmail
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in crm-weekly-digest function:", error);
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