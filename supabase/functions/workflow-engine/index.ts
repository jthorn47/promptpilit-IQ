import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WorkflowTrigger {
  trigger_type: string;
  trigger_value: string;
  context_data: Record<string, any>;
}

interface WorkflowStep {
  action: string;
  params: Record<string, any>;
}

interface WorkflowDefinition {
  id: string;
  workflow_id: string;
  name: string;
  steps: WorkflowStep[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Workflow Engine: Processing request");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { trigger_type, trigger_value, context_data }: WorkflowTrigger = await req.json();
    
    console.log(`🎯 Trigger received: ${trigger_type} - ${trigger_value}`);

    // Find matching workflows
    const { data: workflows, error: workflowError } = await supabaseClient
      .from('automation_workflows')
      .select('*')
      .eq('trigger_type', trigger_type)
      .eq('trigger_value', trigger_value)
      .eq('is_active', true);

    if (workflowError) {
      console.error('❌ Error fetching workflows:', workflowError);
      throw workflowError;
    }

    if (!workflows || workflows.length === 0) {
      console.log(`ℹ️ No workflows found for ${trigger_type}:${trigger_value}`);
      return new Response(JSON.stringify({ 
        message: "No matching workflows found",
        processed: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`📋 Found ${workflows.length} matching workflow(s)`);

    // Process each workflow
    const results = [];
    for (const workflow of workflows) {
      try {
        console.log(`🔄 Processing workflow: ${workflow.name}`);

        // Create execution record
        const { data: execution, error: executionError } = await supabaseClient
          .from('automation_executions')
          .insert({
            workflow_id: workflow.id,
            trigger_data: context_data,
            context_data: context_data,
            status: 'running',
            started_at: new Date().toISOString(),
            current_step: 0
          })
          .select()
          .single();

        if (executionError) {
          console.error(`❌ Error creating execution for ${workflow.name}:`, executionError);
          throw executionError;
        }

        console.log(`✅ Created execution ${execution.id} for workflow ${workflow.name}`);

        // Process workflow steps
        const steps: WorkflowStep[] = workflow.steps || [];
        await processWorkflowSteps(supabaseClient, execution.id, steps, context_data);

        results.push({
          workflow_id: workflow.workflow_id,
          execution_id: execution.id,
          status: 'started'
        });

      } catch (error) {
        console.error(`❌ Error processing workflow ${workflow.name}:`, error);
        results.push({
          workflow_id: workflow.workflow_id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({ 
      message: "Workflows processed",
      results 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("🚨 Workflow Engine Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function processWorkflowSteps(
  supabaseClient: any, 
  executionId: string, 
  steps: WorkflowStep[], 
  contextData: Record<string, any>
) {
  console.log(`📝 Processing ${steps.length} steps for execution ${executionId}`);

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    
    try {
      console.log(`⚡ Step ${i + 1}: ${step.action}`);

      // Create step record
      const { data: stepRecord, error: stepError } = await supabaseClient
        .from('workflow_steps')
        .insert({
          execution_id: executionId,
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

      // Handle delay action differently - schedule for later
      if (step.action === 'delay') {
        const delayMinutes = step.params.minutes || 0;
        const scheduledFor = new Date(Date.now() + delayMinutes * 60 * 1000);
        
        console.log(`⏰ Scheduling remaining steps for ${scheduledFor.toISOString()}`);

        // Update execution to be scheduled
        await supabaseClient
          .from('automation_executions')
          .update({
            scheduled_for: scheduledFor.toISOString(),
            current_step: i + 1,
            status: 'scheduled'
          })
          .eq('id', executionId);

        // Mark delay step as completed
        await supabaseClient
          .from('workflow_steps')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', stepRecord.id);

        // Schedule remaining steps via cron or background task
        if (i + 1 < steps.length) {
          console.log(`📅 Scheduling continuation of workflow`);
          
          // Call workflow-scheduler function to handle delayed execution
          await supabaseClient.functions.invoke('workflow-scheduler', {
            body: {
              execution_id: executionId,
              continue_from_step: i + 1,
              scheduled_for: scheduledFor.toISOString()
            }
          });
        }

        return; // Exit current execution, will continue later
      }

      // Execute immediate action
      const result = await executeAction(supabaseClient, step.action, step.params, contextData);

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
          .eq('id', executionId);

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
        .eq('id', executionId);

      return;
    }
  }

  // All steps completed successfully
  console.log(`🎉 All steps completed for execution ${executionId}`);
  await supabaseClient
    .from('automation_executions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', executionId);
}

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

  // Determine recipient email
  let recipientEmail = '';
  if (to === 'buyer' || to === 'customer') {
    recipientEmail = customer_email || '';
  } else if (to === 'admin') {
    recipientEmail = 'admin@easeworks.com';
  } else {
    recipientEmail = to; // Direct email address
  }

  if (!recipientEmail) {
    return { 
      success: false, 
      error: `No email address found for recipient: ${to}` 
    };
  }

  // Generate email content based on template
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
  const { customer_email, company_name, amount } = contextData;

  console.log(`🏷️ Assigning product: ${sku} to ${customer_email}`);

  try {
    // Find or create client record
    const { data: existingClient, error: clientLookupError } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('company_name', company_name)
      .maybeSingle();

    if (clientLookupError && clientLookupError.code !== 'PGRST116') {
      throw clientLookupError;
    }

    let clientId = existingClient?.id;

    if (!existingClient) {
      // Create new client record
      const { data: newClient, error: clientCreateError } = await supabaseClient
        .from('clients')
        .insert({
          company_name,
          date_won: new Date().toISOString().split('T')[0],
          contract_value: amount || 0,
          currency: 'USD',
          status: 'active',
          onboarding_status: 'pending',
          services_purchased: [{
            sku: sku,
            name: sku === 'SB553-PLAN' ? 'SB 553 Workplace Violence Prevention Plan' : sku,
            purchased_at: new Date().toISOString()
          }]
        })
        .select()
        .single();

      if (clientCreateError) {
        throw clientCreateError;
      }

      clientId = newClient.id;
      console.log(`✅ Created new client record: ${clientId}`);
    } else {
      // Update existing client with new product
      const currentServices = existingClient.services_purchased || [];
      const updatedServices = [
        ...currentServices,
        {
          sku: sku,
          name: sku === 'SB553-PLAN' ? 'SB 553 Workplace Violence Prevention Plan' : sku,
          purchased_at: new Date().toISOString()
        }
      ];

      const { error: updateError } = await supabaseClient
        .from('clients')
        .update({
          services_purchased: updatedServices,
          status: 'active'
        })
        .eq('id', clientId);

      if (updateError) {
        throw updateError;
      }

      console.log(`✅ Updated existing client with new product: ${sku}`);
    }

    console.log(`✅ Product ${sku} assigned successfully to client ${clientId}`);
    return { success: true };

  } catch (error) {
    console.error(`❌ Product assignment failed:`, error);
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
    // For SB553/WVPP plans, we'll send an email with the plan builder link
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
      // Replace template variables
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
    case 'purchase_confirmation':
      return {
        subject: `Purchase Confirmation - Thank you ${customer_name || company_name}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #655DC6; margin: 0;">EaseWorks</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Your Workplace Safety Partner</p>
            </div>
            
            <h2 style="color: #333;">Thank you for your purchase!</h2>
            <p>Hi ${customer_name || company_name},</p>
            <p>We've successfully processed your payment for the SB 553 Workplace Violence Prevention Plan. Here are the details:</p>
            
            <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #655DC6;">
              <h3 style="margin-top: 0; color: #655DC6;">Purchase Details</h3>
              <p><strong>Product:</strong> SB 553 Workplace Violence Prevention Plan</p>
              <p><strong>Company:</strong> ${company_name}</p>
              ${amount ? `<p><strong>Amount:</strong> $${amount}</p>` : ''}
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">What's Next?</h3>
              <p>Your customized workplace violence prevention plan will be generated and sent to you within the next hour. This plan will include:</p>
              <ul>
                <li>✅ California SB 553 compliant policies</li>
                <li>✅ Customized emergency procedures</li>
                <li>✅ Employee training guidelines</li>
                <li>✅ Implementation checklist</li>
              </ul>
            </div>
            
            <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:support@easeworks.com">support@easeworks.com</a>.</p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
              <p>Best regards,<br><strong>The EaseWorks Team</strong></p>
              <p style="font-size: 12px;">© ${new Date().getFullYear()} EaseWorks. All rights reserved.</p>
            </div>
          </div>
        `
      };

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
              <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 14px;">
                Access your personalized workplace violence prevention plan
              </p>
            </div>
            
            <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #655DC6;">Implementation Steps</h3>
              <ol style="padding-left: 20px;">
                <li><strong>Review Your Plan:</strong> Access your customized plan using the link above</li>
                <li><strong>Customize Details:</strong> Tailor the plan to your specific workplace</li>
                <li><strong>Train Your Team:</strong> Share the plan with managers and employees</li>
                <li><strong>Implement Procedures:</strong> Put the safety measures into practice</li>
                <li><strong>Regular Updates:</strong> Review and update your plan periodically</li>
              </ol>
            </div>
            
            <div style="background: #fff8dc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffd700;">
              <h3 style="margin-top: 0; color: #b8860b;">💡 Need Help?</h3>
              <p>Our team is here to support you! Contact us if you need assistance with:</p>
              <ul>
                <li>Plan customization</li>
                <li>Implementation guidance</li>
                <li>Employee training resources</li>
                <li>Ongoing compliance support</li>
              </ul>
              <p><strong>Email:</strong> <a href="mailto:support@easeworks.com">support@easeworks.com</a></p>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
              <p>Best regards,<br><strong>The EaseWorks Team</strong></p>
              <p style="font-size: 12px;">© ${new Date().getFullYear()} EaseWorks. All rights reserved.</p>
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
            <p>Template: ${template}</p>
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
      <p>Your customized SB 553 Workplace Violence Prevention Plan has been generated successfully.</p>
      
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