import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface InvitationRequest {
  email: string;
  name?: string;
  role: string;
  company_id?: string;
  client_id?: string;
  attributes?: Record<string, any>;
  invited_by: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { 
      email, 
      name, 
      role, 
      company_id, 
      client_id, 
      attributes = {}, 
      invited_by 
    }: InvitationRequest = await req.json();

    console.log("Creating user invitation:", { email, role, company_id, client_id });

    // Generate secure invitation token
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('generate_invitation_token');

    if (tokenError) {
      console.error("Token generation error:", tokenError);
      throw new Error("Failed to generate invitation token");
    }

    const invitationToken = tokenData;
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    // Create invitation record
    const { data: invitation, error: invitationError } = await supabase
      .from('user_invitations')
      .insert({
        email,
        invited_by,
        company_id,
        client_id,
        role_assignment: { role, name },
        user_attributes: attributes,
        invitation_token: invitationToken,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (invitationError) {
      console.error("Invitation creation error:", invitationError);
      throw new Error("Failed to create invitation record");
    }

    // Log invitation creation
    await supabase.rpc('log_invitation_action', {
      p_invitation_id: invitation.id,
      p_action_type: 'invitation_created',
      p_performed_by: invited_by,
      p_metadata: { email, role, company_id, client_id }
    });

    // Get company name for email
    const { data: companyData } = await supabase
      .from('company_settings')
      .select('company_name')
      .eq('id', company_id)
      .single();

    const companyName = companyData?.company_name || 'HaaLO IQ';
    const inviteUrl = `${req.headers.get('origin') || 'https://easelearn.com'}/invitation/accept?token=${invitationToken}`;

    // Send invitation email
    const emailResponse = await resend.emails.send({
      from: "HaaLO IQ <onboarding@resend.dev>",
      to: [email],
      subject: `You're invited to join ${companyName} on HaaLO IQ`,
      html: getInvitationEmailTemplate({
        name: name || email,
        inviterName: "Team Member", // Could be enhanced to get actual inviter name
        companyName,
        role,
        inviteUrl,
        expiresAt: expiresAt.toLocaleDateString()
      })
    });

    console.log("Invitation email sent:", {
      messageId: emailResponse.data?.id,
      email,
      timestamp: new Date().toISOString()
    });

    // Log email sent
    await supabase.rpc('log_invitation_action', {
      p_invitation_id: invitation.id,
      p_action_type: 'email_sent',
      p_performed_by: invited_by,
      p_metadata: { 
        email_id: emailResponse.data?.id,
        expires_at: expiresAt.toISOString()
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        invitation_id: invitation.id,
        message: "Invitation sent successfully",
        expires_at: expiresAt.toISOString()
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-user-invitation function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to send invitation",
        details: error.message 
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

function getInvitationEmailTemplate(data: {
  name: string;
  inviterName: string;
  companyName: string;
  role: string;
  inviteUrl: string;
  expiresAt: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #655DC6; margin-bottom: 10px;">Welcome to HaaLO IQ!</h1>
        <p style="color: #666; font-size: 16px;">You've been invited to join ${data.companyName}</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; color: #333;">Hi ${data.name},</p>
        <p style="color: #666; margin-top: 10px;">
          ${data.inviterName} has invited you to join <strong>${data.companyName}</strong> on HaaLO IQ 
          as a <strong>${data.role}</strong>.
        </p>
        <p style="color: #666;">
          HaaLO IQ is a comprehensive HR platform that will help you manage your work more effectively.
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.inviteUrl}" 
           style="background: #655DC6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Accept Invitation & Set Up Account
        </a>
      </div>
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          ⏰ <strong>This invitation expires on ${data.expiresAt}</strong>
        </p>
      </div>
      
      <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
        <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666; font-size: 14px; background: #f8f9fa; padding: 10px; border-radius: 4px;">${data.inviteUrl}</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">
          If you have any questions, please contact your administrator.<br>
          Best regards,<br>The HaaLO IQ Team
        </p>
      </div>
    </div>
  `;
}

serve(handler);