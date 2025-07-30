import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StateExpansionNotification {
  trigger: 'new_unsupported_state' | 'high_priority_state';
  state_code: string;
  employee_name: string;
  employee_id: string;
  company_id?: string;
  employee_count?: number;
  priority?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: StateExpansionNotification = await req.json();
    console.log("State expansion notification received:", payload);

    // Get admin users to notify
    const { data: adminUsers, error: adminError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        profiles!inner(email, first_name, last_name)
      `)
      .in('role', ['super_admin', 'company_admin']);

    if (adminError) {
      console.error("Error fetching admin users:", adminError);
      throw new Error("Failed to fetch admin users");
    }

    if (!adminUsers || adminUsers.length === 0) {
      console.log("No admin users found to notify");
      return new Response(JSON.stringify({ message: "No admin users to notify" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get company information if available
    let companyName = "Unknown Company";
    if (payload.company_id) {
      const { data: companyData } = await supabase
        .from('company_settings')
        .select('company_name')
        .eq('id', payload.company_id)
        .single();
      
      if (companyData) {
        companyName = companyData.company_name;
      }
    }

    // Prepare email content based on trigger type
    let subject: string;
    let htmlContent: string;
    let priority: string = payload.priority || 'medium';

    if (payload.trigger === 'new_unsupported_state') {
      subject = `🚨 New State Tax Support Needed: ${payload.state_code}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🚨 New State Tax Support Required</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #856404; margin: 0 0 10px 0;">⚠️ Action Required</h2>
              <p style="color: #856404; margin: 0;">A new employee has been added in a state that doesn't have tax table support.</p>
            </div>

            <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 5px;">Employee Details</h3>
            <ul style="background: #f8f9fa; padding: 15px; border-radius: 5px; list-style: none;">
              <li><strong>Employee Name:</strong> ${payload.employee_name}</li>
              <li><strong>Company:</strong> ${companyName}</li>
              <li><strong>State:</strong> ${payload.state_code}</li>
              <li><strong>Priority:</strong> <span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">HIGH</span></li>
            </ul>

            <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 5px;">Next Steps</h3>
            <ol style="color: #555; line-height: 1.6;">
              <li><strong>Research Tax Requirements:</strong> Investigate ${payload.state_code} state income tax, disability, and local tax requirements</li>
              <li><strong>Implement Tax Tables:</strong> Add ${payload.state_code} tax brackets to the database</li>
              <li><strong>Update TaxIQ Engine:</strong> Modify tax calculation logic to handle ${payload.state_code} taxes</li>
              <li><strong>Test Calculations:</strong> Verify tax calculations are accurate for ${payload.state_code}</li>
              <li><strong>Update Documentation:</strong> Document the new state support</li>
            </ol>

            <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 8px;">
              <h3 style="color: #1976d2; margin-top: 0;">📋 Implementation Checklist</h3>
              <div style="font-size: 14px; color: #333;">
                <p>☐ Research ${payload.state_code} tax laws and rates<br>
                ☐ Create ${payload.state_code} tax bracket entries<br>
                ☐ Update state tax calculation functions<br>
                ☐ Add ${payload.state_code} to supported states list<br>
                ☐ Test payroll calculations for ${payload.state_code}<br>
                ☐ Notify payroll administrators</p>
              </div>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/editor" 
                 style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                🔧 Access Database
              </a>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; text-align: center;">
              This is an automated notification from your TaxIQ Engine.<br>
              Employee ID: ${payload.employee_id}
            </p>
          </div>
        </div>
      `;
    } else {
      // High priority state notification
      const urgencyColor = priority === 'critical' ? '#dc3545' : '#fd7e14';
      const urgencyText = priority === 'critical' ? '🔥 CRITICAL' : '⚡ HIGH PRIORITY';
      
      subject = `${urgencyText}: ${payload.state_code} Tax Support Urgent (${payload.employee_count} employees)`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, ${urgencyColor} 0%, #dc3545 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">${urgencyText}: State Tax Support</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #721c24; margin: 0 0 10px 0;">🚨 ${urgencyText}</h2>
              <p style="color: #721c24; margin: 0; font-weight: bold;">
                ${payload.state_code} now has ${payload.employee_count} employees and needs immediate tax support!
              </p>
            </div>

            <h3 style="color: #333; border-bottom: 2px solid #dc3545; padding-bottom: 5px;">Current Status</h3>
            <ul style="background: #f8f9fa; padding: 15px; border-radius: 5px; list-style: none;">
              <li><strong>State:</strong> ${payload.state_code}</li>
              <li><strong>Employee Count:</strong> ${payload.employee_count}</li>
              <li><strong>Latest Employee:</strong> ${payload.employee_name}</li>
              <li><strong>Company:</strong> ${companyName}</li>
              <li><strong>Priority Level:</strong> <span style="background: ${urgencyColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${priority.toUpperCase()}</span></li>
            </ul>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">⏰ Immediate Action Required</h3>
              <p style="color: #856404; margin: 0;">
                With ${payload.employee_count} employees in ${payload.state_code}, tax compliance is now critical. 
                ${priority === 'critical' ? 'This state must be implemented IMMEDIATELY to avoid payroll compliance issues.' : 'This state should be prioritized for implementation.'}
              </p>
            </div>

            <h3 style="color: #333; border-bottom: 2px solid #dc3545; padding-bottom: 5px;">Implementation Timeline</h3>
            <div style="color: #555; line-height: 1.6;">
              <p><strong>Target Completion:</strong> ${priority === 'critical' ? '1-2 business days' : '3-5 business days'}</p>
              <ol>
                <li><strong>Day 1:</strong> Research ${payload.state_code} tax requirements and rates</li>
                <li><strong>Day 2:</strong> Implement tax tables and calculation logic</li>
                <li><strong>Day 3:</strong> Test and validate calculations</li>
                <li><strong>Day 4:</strong> Deploy and notify stakeholders</li>
              </ol>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/editor" 
                 style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                🚨 Implement Now
              </a>
              <a href="${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/editor?table=state_expansion_requests" 
                 style="background: #6c757d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                📋 View Requests
              </a>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; text-align: center;">
              This is an automated ${priority} priority notification from your TaxIQ Engine.<br>
              Employee ID: ${payload.employee_id}
            </p>
          </div>
        </div>
      `;
    }

    // Send emails to all admin users
    const emailPromises = adminUsers.map(async (user: any) => {
      const userEmail = user.profiles?.email;
      const userName = user.profiles?.first_name || 'Admin';
      
      if (!userEmail) {
        console.log(`Skipping user ${user.user_id} - no email found`);
        return null;
      }

      try {
        const emailResponse = await resend.emails.send({
          from: "TaxIQ Engine <notifications@easeworks.com>",
          to: [userEmail],
          subject: subject,
          html: htmlContent,
          headers: {
            'X-Priority': priority === 'critical' ? '1' : '2',
            'X-Entity-Ref-ID': payload.employee_id,
          },
        });

        console.log(`Email sent to ${userEmail}:`, emailResponse);
        return emailResponse;
      } catch (error) {
        console.error(`Failed to send email to ${userEmail}:`, error);
        return { error: error.message };
      }
    });

    const emailResults = await Promise.all(emailPromises);
    const successfulEmails = emailResults.filter(result => result && !result.error);
    const failedEmails = emailResults.filter(result => result && result.error);

    console.log(`State expansion notification completed:`, {
      trigger: payload.trigger,
      state: payload.state_code,
      emailsSent: successfulEmails.length,
      emailsFailed: failedEmails.length,
    });

    // Log the notification in our monitoring system
    await supabase.from('tax_monitoring_log').insert({
      source: 'state_expansion_monitor',
      monitor_type: 'employee_state_check',
      status: 'notification_sent',
      changes_detected: 1,
      monitoring_data: {
        trigger: payload.trigger,
        state_code: payload.state_code,
        employee_id: payload.employee_id,
        emails_sent: successfulEmails.length,
        emails_failed: failedEmails.length,
        priority: priority,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      message: "State expansion notifications sent",
      emailsSent: successfulEmails.length,
      emailsFailed: failedEmails.length,
      results: emailResults,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in state expansion notification:", error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);