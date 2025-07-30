import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { getResendClient } from '../_shared/resend-client.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  email: string;
  type: 'confirmation' | 'reset' | 'welcome';
  firstName?: string;
  lastName?: string;
  confirmationUrl?: string;
  resetUrl?: string;
}

// Exponential backoff retry logic
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (error.message?.includes('Invalid API key') || 
          error.message?.includes('Forbidden')) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Email templates
function getEmailContent(type: string, data: any) {
  switch (type) {
    case 'confirmation':
      return {
        subject: 'Welcome! Please confirm your email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #655DC6;">Welcome to EaseBase!</h1>
            <p>Hi ${data.firstName || 'there'},</p>
            <p>Thanks for signing up! Please confirm your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.confirmationUrl}" 
                 style="background: #655DC6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Confirm Email Address
              </a>
            </div>
            <p>If the button doesn't work, copy and paste this link:</p>
            <p style="word-break: break-all; color: #666;">${data.confirmationUrl}</p>
            <p>Best regards,<br>The EaseBase Team</p>
          </div>
        `
      };
    
    case 'reset':
      return {
        subject: 'Reset your password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #655DC6;">Password Reset</h1>
            <p>Hi there,</p>
            <p>You requested to reset your password. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetUrl}" 
                 style="background: #655DC6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>If the button doesn't work, copy and paste this link:</p>
            <p style="word-break: break-all; color: #666;">${data.resetUrl}</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>Best regards,<br>The EaseBase Team</p>
          </div>
        `
      };
    
    case 'welcome':
      return {
        subject: 'Welcome to EaseBase!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #655DC6;">Welcome to EaseBase!</h1>
            <p>Hi ${data.firstName || 'there'},</p>
            <p>Your account has been successfully created! You can now access all the features of our time and attendance system.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3>Getting Started:</h3>
              <ul>
                <li>Log in to your dashboard</li>
                <li>Set up your profile</li>
                <li>Explore the time tracking features</li>
              </ul>
            </div>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The EaseBase Team</p>
          </div>
        `
      };
    
    default:
      throw new Error('Unknown email type');
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
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
    const { email, type, firstName, lastName, confirmationUrl, resetUrl }: AuthEmailRequest = await req.json();

    if (!email || !type) {
      return new Response(
        JSON.stringify({ error: "Email and type are required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get email content based on type
    const emailContent = getEmailContent(type, {
      firstName,
      lastName,
      confirmationUrl,
      resetUrl
    });

    // Send email with retry logic
    const emailResponse = await retryWithBackoff(async () => {
      return await resend.emails.send({
        from: "EaseLearn <noreply@easeworks.com>",
        to: [email],
        subject: emailContent.subject,
        html: emailContent.html,
      });
    });

    console.log("Email sent successfully:", {
      messageId: emailResponse.data?.id,
      email,
      type,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.data?.id,
        message: "Email sent successfully" 
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
    console.error("Error in send-auth-email function:", error);
    
    // Handle specific Resend errors
    let errorMessage = "Failed to send email";
    let statusCode = 500;
    
    if (error.message?.includes('rate limit')) {
      errorMessage = "Rate limit exceeded. Please try again later.";
      statusCode = 429;
    } else if (error.message?.includes('Invalid email')) {
      errorMessage = "Invalid email address";
      statusCode = 400;
    } else if (error.message?.includes('API key')) {
      errorMessage = "Email service configuration error";
      statusCode = 500;
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message 
      }),
      {
        status: statusCode,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);