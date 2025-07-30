import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { getResendClient } from '../_shared/resend-client.ts';
import { EnhancedBrandService } from '../_shared/enhanced-brand-service.ts';

// Brand configuration helpers
function getBrandDisplayName(brandIdentity: string): string {
  switch (brandIdentity) {
    case 'easeworks': return 'Easeworks';
    case 'easelearn': return 'EaseLearn';
    case 'dual': return 'Dual Brand';
    default: return 'Easeworks';
  }
}

function getBrandEmailDomain(brandIdentity: string): string {
  switch (brandIdentity) {
    case 'easeworks': return 'easeworks.com';
    case 'easelearn': return 'easelearn.com';
    case 'dual': return 'easeworks.com'; // Default for dual
    default: return 'easeworks.com';
  }
}

function addSubjectPrefix(subject: string, brandIdentity: string): string {
  const prefix = getSubjectPrefix(brandIdentity);
  return subject.startsWith(prefix) ? subject : `${prefix} ${subject}`;
}

function getSubjectPrefix(brandIdentity: string): string {
  switch (brandIdentity) {
    case 'easeworks': return '[Easeworks]';
    case 'easelearn': return '[EaseLearn]';
    case 'dual': return '[Dual Brand]';
    default: return '[Easeworks]';
  }
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailContext {
  type: 'company' | 'contact' | 'direct';
  companyId?: string;
  contactId?: string;
  leadId?: string;
}

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from_name?: string;
  from_email?: string;
  reply_to?: string;
  context?: EmailContext;
  data?: any;
  brandIdentity?: string;
  emailContext?: string;
}

// Get the authenticated user from the request
const getAuthenticatedUser = async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;

  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
};

// Log email to database with contextual information
const logEmail = async (emailData: any, context?: EmailContext, senderId?: string) => {
  try {
    const logEntry = {
      to_email: emailData.to[0],
      subject: emailData.subject,
      body: emailData.html,
      from_name: emailData.from,
      from_email: emailData.from,
      reply_to: emailData.replyTo,
      status: 'sent',
      message_id: emailData.messageId,
      sent_at: new Date().toISOString(),
      sender_id: senderId,
      company_id: context?.companyId || null,
      contact_id: context?.contactId || null,
      lead_id: context?.leadId || null,
    };

    const { error } = await supabase
      .from('email_logs')
      .insert(logEntry);

    if (error) {
      console.error('Error logging email:', error);
    } else {
      console.log('Email logged successfully with context:', context?.type);
    }
  } catch (error) {
    console.error('Error in logEmail:', error);
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      to, 
      subject, 
      html, 
      from_name, 
      from_email, 
      reply_to,
      context,
      data,
      brandIdentity,
      emailContext = 'default'
    }: EmailRequest = await req.json();

    // STEP 7: Require brand_identity and validate
    if (!brandIdentity) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'brand_identity is required for all email operations' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate and get comprehensive brand configuration
    const brandConfig = await EnhancedBrandService.getBrandedEmailConfig(brandIdentity, emailContext);
    console.log('Using brand configuration:', brandConfig.identity);

    // Set brand-appropriate defaults using enhanced service
    const finalFromName = from_name || brandConfig.fromName;
    const finalFromEmail = from_email || brandConfig.noReplyEmail;
    const finalReplyTo = reply_to || brandConfig.supportEmail;
    const brandedSubject = EnhancedBrandService.addSubjectPrefix(subject, brandConfig.identity);

    // Get authenticated user for logging
    const user = await getAuthenticatedUser(req);

    // Get Resend client from integration
    const resend = await getResendClient();

    const emailResponse = await resend.emails.send({
      from: `${finalFromName} <${finalFromEmail}>`,
      to: [to],
      subject: brandedSubject,
      html: html,
      replyTo: finalReplyTo,
    });

    console.log("Email sent successfully:", emailResponse);

    // STEP 4: Enhanced email logging with brand identity
    if (emailResponse.data?.id) {
      await EnhancedBrandService.logBrandedEmail({
        to,
        from: `${finalFromName} <${finalFromEmail}>`,
        subject: brandedSubject,
        html,
        brandIdentity: brandConfig.identity,
        userId: user?.id,
        messageId: emailResponse.data.id,
        context: {
          emailContext,
          requestContext: context,
          brandConfig: {
            domain: brandConfig.emailDomain,
            displayName: brandConfig.displayName
          }
        }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id,
      brandUsed: brandConfig.identity,
      emailDomain: brandConfig.emailDomain
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    
    // Also log failed emails
    try {
      const user = await getAuthenticatedUser(req);
      if (user) {
        const body = await req.clone().json();
        await supabase
          .from('email_logs')
          .insert({
            to_email: body.to,
            subject: body.subject,
            body: body.html,
            status: 'failed',
            error_message: error.message,
            sender_id: user.id,
            company_id: body.context?.companyId || null,
            contact_id: body.context?.contactId || null,
            lead_id: body.context?.leadId || null,
          });
      }
    } catch (logError) {
      console.error('Error logging failed email:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);