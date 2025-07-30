import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type EmailContext = 'company' | 'contact' | 'direct';

interface EmailData {
  [key: string]: any;
}

interface ContextualEmailParams {
  to: string;
  subject: string;
  body: string;
  context: {
    type: EmailContext;
    companyId?: string;
    contactId?: string;
    leadId?: string;
  };
  data?: EmailData;
}

export const useContextualEmailService = () => {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const sendContextualEmail = async (params: ContextualEmailParams): Promise<boolean> => {
    setSending(true);
    
    try {
      // Validate contextual sending rules
      const isValid = await validateContextualSending(params);
      if (!isValid) {
        throw new Error('Invalid recipient for this context');
      }

      // Send via the enhanced send-email edge function
      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: params.to,
          subject: params.subject,
          html: params.body,
          context: params.context,
          data: params.data
        }
      });

      if (error) throw error;

      if (result?.success) {
        toast({
          title: "Success",
          description: "Email sent successfully",
        });
        return true;
      } else {
        throw new Error(result?.error || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Contextual email sending error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
      return false;
    } finally {
      setSending(false);
    }
  };

  const validateContextualSending = async (params: ContextualEmailParams): Promise<boolean> => {
    const { to, context } = params;

    switch (context.type) {
      case 'company':
        if (!context.companyId) return false;
        // Validate that recipient is a contact of this company
        const { data: companyContacts } = await supabase
          .from('company_contacts')
          .select('email')
          .eq('company_id', context.companyId);
        
        return companyContacts?.some(contact => contact.email === to) || false;

      case 'contact':
        if (!context.contactId) return false;
        // Validate that recipient matches specific contact
        const { data: contactData } = await supabase
          .from('company_contacts')
          .select('email')
          .eq('id', context.contactId)
          .single();
        
        return contactData?.email === to;

      case 'direct':
        // Direct mode allows any valid email
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to);

      default:
        return false;
    }
  };

  // Company context: send to company's associated contacts only
  const sendCompanyEmail = async (companyId: string, to: string, subject: string, body: string, data?: EmailData) => {
    return sendContextualEmail({
      to,
      subject,
      body,
      context: { type: 'company', companyId },
      data
    });
  };

  // Contact context: send to specific contact only
  const sendContactEmail = async (contactId: string, to: string, subject: string, body: string, data?: EmailData) => {
    return sendContextualEmail({
      to,
      subject,
      body,
      context: { type: 'contact', contactId },
      data
    });
  };

  // Direct context: send to any recipient
  const sendDirectEmail = async (to: string, subject: string, body: string, data?: EmailData) => {
    return sendContextualEmail({
      to,
      subject,
      body,
      context: { type: 'direct' },
      data
    });
  };

  return {
    sending,
    sendContextualEmail,
    sendCompanyEmail,
    sendContactEmail,
    sendDirectEmail
  };
};