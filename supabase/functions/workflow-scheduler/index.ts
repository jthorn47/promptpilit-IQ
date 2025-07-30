import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    console.log("⏰ Workflow Scheduler: Processing scheduled workflows");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if this is a specific scheduled continuation
    const body = await req.text();
    let specificExecution = null;
    
    if (body) {
      try {
        const parsed = JSON.parse(body);
        specificExecution = parsed;
      } catch (e) {
        // Not JSON, proceed with general scheduling
      }
    }

    if (specificExecution) {
      // Handle specific scheduled execution
      console.log(`📋 Processing specific execution: ${specificExecution.execution_id}`);
      await processScheduledExecution(supabaseClient, specificExecution);
      
      return new Response(JSON.stringify({ 
        message: "Scheduled execution processed",
        execution_id: specificExecution.execution_id 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Process all scheduled executions that are due
    const { data: scheduledExecutions, error } = await supabaseClient
      .from('automation_executions')
      .select(`
        *,
        automation_workflows!inner(*)
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString())
      .limit(10);

    if (error) {
      console.error('❌ Error fetching scheduled executions:', error);
      throw error;
    }

    console.log(`📅 Found ${scheduledExecutions?.length || 0} scheduled executions to process`);

    const results = [];
    for (const execution of scheduledExecutions || []) {
      try {
        await continueWorkflowExecution(supabaseClient, execution);
        results.push({
          execution_id: execution.id,
          status: 'processed'
        });
      } catch (error) {
        console.error(`❌ Error processing execution ${execution.id}:`, error);
        results.push({
          execution_id: execution.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({ 
      message: "Scheduled workflows processed",
      processed: results.length,
      results 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("🚨 Workflow Scheduler Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function processScheduledExecution(supabaseClient: any, scheduledData: any) {
  const { execution_id, continue_from_step, scheduled_for } = scheduledData;
  
  console.log(`⏰ Checking if execution ${execution_id} is ready to continue`);
  
  // Check if it's time to continue
  const scheduledTime = new Date(scheduled_for);
  const now = new Date();
  
  if (now < scheduledTime) {
    console.log(`⏱️ Not yet time to continue execution ${execution_id}. Scheduled for: ${scheduled_for}`);
    return;
  }

  // Get execution details
  const { data: execution, error: execError } = await supabaseClient
    .from('automation_executions')
    .select(`
      *,
      automation_workflows!inner(*)
    `)
    .eq('id', execution_id)
    .single();

  if (execError || !execution) {
    console.error(`❌ Error fetching execution ${execution_id}:`, execError);
    return;
  }

  await continueWorkflowExecution(supabaseClient, execution, continue_from_step);
}

async function continueWorkflowExecution(supabaseClient: any, execution: any, startFromStep?: number) {
  console.log(`🔄 Continuing workflow execution: ${execution.id}`);

  // Update status to running
  await supabaseClient
    .from('automation_executions')
    .update({
      status: 'running',
      scheduled_for: null
    })
    .eq('id', execution.id);

  const workflow = execution.automation_workflows;
  const steps = workflow.steps || [];
  const startStep = startFromStep || execution.current_step || 0;
  
  console.log(`📝 Continuing from step ${startStep + 1} of ${steps.length}`);

  // Continue processing remaining steps
  for (let i = startStep; i < steps.length; i++) {
    const step = steps[i];
    
    try {
      console.log(`⚡ Step ${i + 1}: ${step.action}`);

      // Create step record
      const { data: stepRecord, error: stepError } = await supabaseClient
        .from('workflow_steps')
        .insert({
          execution_id: execution.id,
          step_number: i + 1,
          action: step.action,
          params: step.params,
          status: 'running',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (stepError) {
        console.error(`❌ Error creating step record:`, stepError);
        throw stepError;
      }

      // Handle delay action differently
      if (step.action === 'delay') {
        const delayMinutes = step.params.minutes || 0;
        const scheduledFor = new Date(Date.now() + delayMinutes * 60 * 1000);
        
        console.log(`⏰ Scheduling next continuation for ${scheduledFor.toISOString()}`);

        // Update execution to be scheduled again
        await supabaseClient
          .from('automation_executions')
          .update({
            scheduled_for: scheduledFor.toISOString(),
            current_step: i + 1,
            status: 'scheduled'
          })
          .eq('id', execution.id);

        // Mark delay step as completed
        await supabaseClient
          .from('workflow_steps')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', stepRecord.id);

        // Schedule next continuation if there are more steps
        if (i + 1 < steps.length) {
          await supabaseClient.functions.invoke('workflow-scheduler', {
            body: {
              execution_id: execution.id,
              continue_from_step: i + 1,
              scheduled_for: scheduledFor.toISOString()
            }
          });
        }

        return; // Exit current execution
      }

      // Execute immediate action
      const result = await executeAction(supabaseClient, step.action, step.params, execution.context_data || {});

      // Update step status
      await supabaseClient
        .from('workflow_steps')
        .update({
          status: result.success ? 'completed' : 'failed',
          completed_at: new Date().toISOString(),
          error_message: result.error || null
        })
        .eq('id', stepRecord.id);

      if (!result.success) {
        console.error(`❌ Step ${i + 1} failed:`, result.error);
        
        // Update execution status to failed
        await supabaseClient
          .from('automation_executions')
          .update({
            status: 'failed',
            error_message: result.error,
            completed_at: new Date().toISOString()
          })
          .eq('id', execution.id);

        return;
      }

      console.log(`✅ Step ${i + 1} completed successfully`);

    } catch (error) {
      console.error(`💥 Fatal error in step ${i + 1}:`, error);
      
      // Update execution status to failed
      await supabaseClient
        .from('automation_executions')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString()
        })
        .eq('id', execution.id);

      return;
    }
  }

  // All steps completed successfully
  console.log(`🎉 All steps completed for execution ${execution.id}`);
  await supabaseClient
    .from('automation_executions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', execution.id);
}

// Duplicate the action execution functions from workflow-engine
async function executeAction(
  supabaseClient: any, 
  action: string, 
  params: Record<string, any>, 
  contextData: Record<string, any>
): Promise<{ success: boolean; error?: string; result?: any }> {
  
  console.log(`🎬 Executing action: ${action}`, params);

  try {
    switch (action) {
      case 'send_email':
        return await executeEmailAction(supabaseClient, params, contextData);
      
      case 'assign_product':
        return await executeAssignProductAction(supabaseClient, params, contextData);
      
      case 'generate_plan':
        return await executeGeneratePlanAction(supabaseClient, params, contextData);
      
      case 'internal_notify':
        return await executeInternalNotifyAction(supabaseClient, params, contextData);
      
      case 'mark_status':
        return await executeMarkStatusAction(supabaseClient, params, contextData);
      
      default:
        return { 
          success: false, 
          error: `Unknown action: ${action}` 
        };
    }
  } catch (error) {
    console.error(`💥 Action execution failed:`, error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

async function executeEmailAction(
  supabaseClient: any, 
  params: Record<string, any>, 
  contextData: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  
  const { template, to } = params;
  const { customer_email, customer_name, company_name } = contextData;

  console.log(`📧 Sending email template: ${template} to: ${to}`);

  let recipientEmail = '';
  if (to === 'buyer' || to === 'customer') {
    recipientEmail = customer_email || '';
  } else if (to === 'admin') {
    recipientEmail = 'admin@easeworks.com';
  } else {
    recipientEmail = to;
  }

  if (!recipientEmail) {
    return { 
      success: false, 
      error: `No email address found for recipient: ${to}` 
    };
  }

  const emailContent = generateEmailContent(template, contextData);

  try {
    const { error } = await supabaseClient.functions.invoke('send-email', {
      body: {
        to: recipientEmail,
        subject: emailContent.subject,
        html: emailContent.html
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    console.log(`✅ Email sent successfully to ${recipientEmail}`);
    return { success: true };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function executeAssignProductAction(
  supabaseClient: any, 
  params: Record<string, any>, 
  contextData: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  
  const { sku } = params;
  const { company_name } = contextData;

  console.log(`🏷️ Assigning product SKU: ${sku} to ${company_name}`);

  try {
    const { error } = await supabaseClient
      .from('clients')
      .upsert({
        company_name: company_name,
        services_purchased: [{ sku, assigned_at: new Date().toISOString() }],
        status: 'active'
      }, { 
        onConflict: 'company_name' 
      });

    if (error) {
      return { success: false, error: error.message };
    }

    console.log(`✅ Product ${sku} assigned successfully`);
    return { success: true };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function executeGeneratePlanAction(
  supabaseClient: any, 
  params: Record<string, any>, 
  contextData: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  
  const { plan_type } = params;
  const { customer_email, company_name } = contextData;

  console.log(`📋 Generating ${plan_type} plan for ${company_name}`);

  try {
    if (plan_type === 'WVPP') {
      const planLink = 'https://sb553-plan-builder-wizard.lovable.app/';
      
      const { error } = await supabaseClient.functions.invoke('send-email', {
        body: {
          to: customer_email,
          subject: `Your SB 553 Workplace Violence Prevention Plan - ${company_name}`,
          html: generatePlanGenerationEmail(company_name, planLink)
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    console.log(`✅ Plan generation initiated for ${plan_type}`);
    return { success: true };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function executeInternalNotifyAction(
  supabaseClient: any, 
  params: Record<string, any>, 
  contextData: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  
  const { type, message } = params;
  const { company_name, customer_email, amount } = contextData;

  console.log(`🔔 Internal notification: ${type} - ${message}`);

  try {
    if (type === 'email') {
      const finalMessage = message
        .replace('{{company_name}}', company_name || 'Unknown Company')
        .replace('{{customer_email}}', customer_email || 'Unknown Email')
        .replace('{{amount}}', amount || 'Unknown Amount');

      const { error } = await supabaseClient.functions.invoke('send-email', {
        body: {
          to: 'admin@easeworks.com',
          subject: 'Workflow Notification',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #655DC6;">Workflow Notification</h2>
              <p>${finalMessage}</p>
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Company:</strong> ${company_name || 'Unknown'}</p>
                <p><strong>Email:</strong> ${customer_email || 'Unknown'}</p>
                <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
              </div>
            </div>
          `
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    console.log(`✅ Internal notification sent successfully`);
    return { success: true };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function executeMarkStatusAction(
  supabaseClient: any, 
  params: Record<string, any>, 
  contextData: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  
  const { status, target } = params;
  const { company_name } = contextData;

  console.log(`🏷️ Marking status: ${status} for ${target}`);

  try {
    if (target === 'client') {
      const { error } = await supabaseClient
        .from('clients')
        .update({ status })
        .eq('company_name', company_name);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    console.log(`✅ Status marked successfully`);
    return { success: true };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

function generateEmailContent(template: string, contextData: Record<string, any>) {
  const { customer_name, company_name, amount } = contextData;

  switch (template) {
    case 'admin_setup_guide':
      return {
        subject: `Your SB 553 Plan is Ready - Implementation Guide for ${company_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #655DC6; margin: 0;">EaseWorks</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Your Workplace Safety Partner</p>
            </div>
            
            <h2 style="color: #333;">Your SB 553 Plan is Ready!</h2>
            <p>Hi ${customer_name || company_name},</p>
            <p>Great news! Your customized SB 553 Workplace Violence Prevention Plan has been generated and is ready for implementation.</p>
            
            <div style="background: linear-gradient(135deg, #655DC6, #8B7ED8); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
              <h3 style="color: white; margin: 0 0 15px 0;">🎯 Access Your Plan Builder</h3>
              <a href="https://sb553-plan-builder-wizard.lovable.app/" 
                 style="display: inline-block; background: white; color: #655DC6; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0;">
                Open Plan Builder →
              </a>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
              <p>Best regards,<br><strong>The EaseWorks Team</strong></p>
            </div>
          </div>
        `
      };

    default:
      return {
        subject: 'Notification from EaseWorks',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #655DC6;">Notification</h2>
            <p>This is an automated message from the EaseWorks workflow system.</p>
          </div>
        `
      };
  }
}

function generatePlanGenerationEmail(companyName: string, planLink: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #655DC6; margin: 0;">EaseWorks</h1>
        <p style="color: #666; margin: 5px 0 0 0;">Your Workplace Safety Partner</p>
      </div>
      
      <h2 style="color: #333;">Your SB 553 Plan Generation is Complete!</h2>
      <p>Hi ${companyName},</p>
      
      <div style="background: linear-gradient(135deg, #655DC6, #8B7ED8); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
        <h3 style="color: white; margin: 0 0 15px 0;">🎯 Access Your Plan</h3>
        <a href="${planLink}" 
           style="display: inline-block; background: white; color: #655DC6; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0;">
          Open Your Plan →
        </a>
      </div>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
        <p>Best regards,<br><strong>The EaseWorks Team</strong></p>
      </div>
    </div>
  `;
}