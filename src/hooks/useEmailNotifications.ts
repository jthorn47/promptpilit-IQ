import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useEmailNotifications() {
  const { toast } = useToast();

  useEffect(() => {
    // Listen for new emails in crm_email_messages
    const crmEmailChannel = supabase
      .channel('crm-email-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crm_email_messages'
        },
        (payload) => {
          const emailData = payload.new as any;
          
          // Only show notifications for received emails (not sent)
          if (emailData.message_type === 'received' || !emailData.is_sent) {
            toast({
              title: "📧 New Email Received",
              description: `From: ${emailData.from_address || 'Unknown'}\nSubject: ${emailData.subject || 'No Subject'}`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Listen for new email campaigns
    const campaignChannel = supabase
      .channel('email-campaign-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'email_campaigns'
        },
        (payload) => {
          const campaignData = payload.new as any;
          
          toast({
            title: "📬 New Email Campaign",
            description: `Campaign: ${campaignData.name || 'Untitled'}\nStatus: ${campaignData.status || 'Created'}`,
            duration: 4000,
          });
        }
      )
      .subscribe();

    // Listen for email sending history updates
    const sendingHistoryChannel = supabase
      .channel('email-sending-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'email_sending_history'
        },
        (payload) => {
          const historyData = payload.new as any;
          
          if (historyData.status === 'delivered') {
            toast({
              title: "✅ Email Delivered",
              description: `Email successfully sent to ${historyData.recipient_email}`,
              duration: 3000,
            });
          } else if (historyData.status === 'failed') {
            toast({
              title: "❌ Email Failed",
              description: `Failed to send email to ${historyData.recipient_email}`,
              variant: "destructive",
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Listen for new chat messages (if applicable)
    const chatChannel = supabase
      .channel('chat-message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const messageData = payload.new as any;
          
          if (messageData.requires_review) {
            toast({
              title: "⚠️ Chat Message Needs Review",
              description: `New message requires attention: ${messageData.user_message?.substring(0, 50)}...`,
              variant: "destructive",
              duration: 6000,
            });
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(crmEmailChannel);
      supabase.removeChannel(campaignChannel);
      supabase.removeChannel(sendingHistoryChannel);
      supabase.removeChannel(chatChannel);
    };
  }, [toast]);
}