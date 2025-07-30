import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BrandService } from "@/services/BrandService";
import { BrandIdentity } from "@/types/brand";

export type EmailType = 'training_invitation' | 'training_reminder' | 'completion_certificate' | 'training_notification';

interface EmailData {
  employeeName?: string;
  trainingTitle?: string;
  dueDate?: string;
  companyName?: string;
  certificateUrl?: string;
  loginUrl?: string;
  managerName?: string;
  subject?: string;
  message?: string;
  actionUrl?: string;
  actionText?: string;
  [key: string]: any;
}

interface SendEmailParams {
  type: EmailType;
  to: string;
  data: EmailData;
  brandIdentity?: BrandIdentity;
  context?: string;
}

export const useEmailService = () => {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const sendEmail = async ({ type, to, data, brandIdentity, context }: SendEmailParams): Promise<boolean> => {
    setSending(true);
    
    try {
      // Auto-detect brand identity if not provided
      let finalBrandIdentity = brandIdentity;
      if (!finalBrandIdentity) {
        const user = await supabase.auth.getUser();
        if (user.data.user) {
          finalBrandIdentity = await BrandService.getUserBrandIdentity(user.data.user.id) || 'easeworks';
        } else {
          finalBrandIdentity = 'easeworks';
        }
      }

      // Get branded email address
      const fromEmail = await BrandService.getBrandedEmailAddress(finalBrandIdentity, context || 'default');

      const { data: result, error } = await supabase.functions.invoke('send-training-email', {
        body: {
          type,
          to,
          from_email: fromEmail,
          brand_identity: finalBrandIdentity,
          context: context || 'default',
          data: {
            ...data,
            loginUrl: data.loginUrl || `${window.location.origin}/training-login`,
            companyName: data.companyName || 'EaseLearn'
          }
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
      console.error('Email sending error:', error);
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

  const sendTrainingInvitation = async (to: string, data: {
    employeeName: string;
    trainingTitle: string;
    dueDate?: string;
    companyName?: string;
  }, brandIdentity?: BrandIdentity, context?: string) => {
    return sendEmail({
      type: 'training_invitation',
      to,
      data,
      brandIdentity,
      context: context || 'training'
    });
  };

  const sendTrainingReminder = async (to: string, data: {
    employeeName: string;
    trainingTitle: string;
    dueDate?: string;
    companyName?: string;
  }, brandIdentity?: BrandIdentity, context?: string) => {
    return sendEmail({
      type: 'training_reminder',
      to,
      data,
      brandIdentity,
      context: context || 'training'
    });
  };

  const sendCompletionCertificate = async (to: string, data: {
    employeeName: string;
    trainingTitle: string;
    certificateUrl?: string;
    companyName?: string;
  }, brandIdentity?: BrandIdentity, context?: string) => {
    return sendEmail({
      type: 'completion_certificate',
      to,
      data,
      brandIdentity,
      context: context || 'training'
    });
  };

  const sendTrainingNotification = async (to: string, data: {
    employeeName?: string;
    subject: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
    companyName?: string;
  }, brandIdentity?: BrandIdentity, context?: string) => {
    return sendEmail({
      type: 'training_notification',
      to,
      data,
      brandIdentity,
      context: context || 'training'
    });
  };

  return {
    sending,
    sendEmail,
    sendTrainingInvitation,
    sendTrainingReminder,
    sendCompletionCertificate,
    sendTrainingNotification
  };
};