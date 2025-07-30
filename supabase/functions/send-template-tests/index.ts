import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getResendClient } from '../_shared/resend-client.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  recipientEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting template test emails function");
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Initialize Resend with shared client
    const resend = await getResendClient();

    const { recipientEmail }: TestEmailRequest = await req.json();

    if (!recipientEmail) {
      throw new Error("Recipient email is required");
    }

    console.log(`Sending test emails to: ${recipientEmail}`);

    // Get all active email templates
    const { data: templates, error: templatesError } = await supabase
      .from('email_templates')
      .select('id, name, template_type, subject, html_content, brand_identity')
      .eq('is_active', true)
      .order('brand_identity', { ascending: true });

    if (templatesError) {
      throw templatesError;
    }

    if (!templates || templates.length === 0) {
      throw new Error("No active email templates found");
    }

    console.log(`Found ${templates.length} active email templates`);

    // Get brand email domains
    const getBrandEmailDomain = (brandIdentity: string | null): string => {
      switch (brandIdentity) {
        case 'easeworks':
          return 'easeworks.com';
        case 'easelearn':
          return 'easelearn.com';
        case 'dual':
          return 'easeworks.com'; // Default for dual brand
        default:
          return 'easeworks.com'; // Default fallback
      }
    };

    const getBrandFromEmail = (brandIdentity: string | null): string => {
      // Use only the verified email from integration for all brands until domains are verified
      return 'EaseLearn <hello@easelearn.com>';
    };

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Send test email for each template
    for (const template of templates) {
      try {
        console.log(`Sending test email for template: ${template.name} (${template.brand_identity || 'system'})`);

        // Replace template variables with test data
        const processedSubject = template.subject
          .replace(/\{\{company_name\}\}/g, 'Test Company')
          .replace(/\{\{service_name\}\}/g, 'Test Service')
          .replace(/\{\{user_name\}\}/g, 'Test User');

        const processedBody = template.html_content
          .replace(/\{\{company_name\}\}/g, 'Test Company')
          .replace(/\{\{service_name\}\}/g, 'Test Service')
          .replace(/\{\{user_name\}\}/g, 'Test User')
          .replace(/\{\{reset_link\}\}/g, 'https://example.com/reset-password')
          .replace(/\{\{verification_code\}\}/g, '123456')
          .replace(/\{\{login_link\}\}/g, 'https://example.com/login');

        // Add test email header to body
        const emailBody = `
          <div style="background-color: #f0f0f0; padding: 10px; margin-bottom: 20px; border-left: 4px solid #007bff;">
            <strong>🧪 TEST EMAIL</strong><br>
            Template: ${template.name}<br>
            Type: ${template.template_type}<br>
            Brand: ${template.brand_identity || 'System Default'}<br>
            ID: ${template.id}
          </div>
          ${processedBody}
        `;

        const fromEmail = getBrandFromEmail(template.brand_identity);
        
        const emailResponse = await resend.emails.send({
          from: fromEmail,
          to: [recipientEmail],
          subject: `[TEST] ${processedSubject}`,
          html: emailBody,
        });

        console.log(`✅ Successfully sent email for template ${template.name}:`, emailResponse);
        
        results.push({
          templateId: template.id,
          templateName: template.name,
          templateType: template.template_type,
          brandIdentity: template.brand_identity || 'system',
          fromEmail,
          status: 'success',
          emailId: emailResponse.data?.id,
        });
        
        successCount++;

        // Add a small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (emailError) {
        console.error(`❌ Failed to send email for template ${template.name}:`, emailError);
        
        results.push({
          templateId: template.id,
          templateName: template.name,
          templateType: template.template_type,
          brandIdentity: template.brand_identity || 'system',
          fromEmail: getBrandFromEmail(template.brand_identity),
          status: 'error',
          error: emailError.message,
        });
        
        errorCount++;
      }
    }

    const summary = {
      totalTemplates: templates.length,
      successCount,
      errorCount,
      recipientEmail,
      results,
    };

    console.log("📊 Email sending summary:", summary);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("❌ Error in send-template-tests function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);