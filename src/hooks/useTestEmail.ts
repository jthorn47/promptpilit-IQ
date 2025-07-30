import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BrandService } from '@/services/BrandService';
import { BrandIdentity } from '@/types/brand';

interface SendTestEmailParams {
  templateId: string;
  templateName: string;
  subject: string;
  htmlContent: string;
  testEmail: string;
  variables?: Record<string, string>;
  brandIdentity?: BrandIdentity;
  context?: string;
}

export const useTestEmail = () => {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const sendTestEmail = async ({
    templateId,
    templateName,
    subject,
    htmlContent,
    testEmail,
    variables = {},
    brandIdentity,
    context
  }: SendTestEmailParams) => {
    setSending(true);
    
    try {
      // Replace variables in subject and content
      let processedSubject = subject;
      let processedContent = htmlContent;
      
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(key.replace(/[{}]/g, '\\$&'), 'g');
        processedSubject = processedSubject.replace(regex, value);
        processedContent = processedContent.replace(regex, value);
      });

      // Optimize HTML content for faster email client rendering
      const optimizeEmailHTML = (html: string) => {
        return html
          // Remove excessive whitespace and line breaks
          .replace(/\s+/g, ' ')
          .replace(/>\s+</g, '><')
          // Simplify inline styles by removing redundant properties
          .replace(/margin:\s*0;\s*padding:\s*0;/g, 'margin:0;padding:0;')
          // Remove comments
          .replace(/<!--[\s\S]*?-->/g, '')
          .trim();
      };

      // Add optimized test email header
      const testEmailContent = optimizeEmailHTML(`
        <div style="background:#FEF3C7;border:1px solid #F59E0B;padding:12px;margin-bottom:20px;border-radius:6px;">
          <p style="margin:0;font-size:14px;color:#92400E;font-weight:bold;">
            🧪 TEST EMAIL - Template: ${templateName}
          </p>
          <p style="margin:4px 0 0 0;font-size:12px;color:#78350F;">
            This is a test email sent from the System Email Templates. Template ID: ${templateId}
          </p>
        </div>
        ${optimizeEmailHTML(processedContent)}
      `);

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmail,
          subject: `[TEST] ${processedSubject}`,
          html: testEmailContent,
          from_name: 'EaseLearn System Test',
          from_email: 'noreply@easelearn.com',
          brandIdentity: brandIdentity || 'easelearn',
          emailContext: 'test',
          context: {
            type: 'system',
            templateId: templateId
          }
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Test Email Sent",
          description: `Test email sent successfully to ${testEmail}`,
        });
        return true;
      } else {
        throw new Error(data?.error || 'Failed to send test email');
      }
    } catch (error: any) {
      console.error('Test email error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
      return false;
    } finally {
      setSending(false);
    }
  };

  return {
    sendTestEmail,
    sending
  };
};