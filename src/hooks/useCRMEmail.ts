import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface EmailConnection {
  id: string;
  user_id: string;
  email_address: string;
  connection_status: string;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailMessage {
  id: string;
  user_id: string;
  message_id: string;
  thread_id?: string;
  subject?: string;
  sender_email?: string;
  sender_name?: string;
  recipients?: any;
  cc_recipients?: any;
  bcc_recipients?: any;
  body_preview?: string;
  body_content?: string;
  is_html: boolean;
  is_read: boolean;
  is_sent: boolean;
  has_attachments: boolean;
  message_type: string;
  tracking_enabled: boolean;
  sent_at?: string;
  received_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailSettings {
  id: string;
  user_id: string;
  default_signature?: string;
  enable_tracking: boolean;
  enable_notifications: boolean;
  auto_sync_enabled: boolean;
  sync_frequency_minutes: number;
  settings: any;
  created_at: string;
  updated_at: string;
}

export function useCRMEmail() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connection, setConnection] = useState<EmailConnection | null>(null);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch user's email connection status
  const fetchConnection = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('crm_email_connections')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setConnection(data);
    } catch (error) {
      console.error('Error fetching email connection:', error);
      toast({
        title: "Connection Error",
        description: "Failed to fetch email connection status",
        variant: "destructive"
      });
    }
  };

  // Fetch user's email messages
  const fetchMessages = async (messageType?: 'sent' | 'received' | 'draft') => {
    if (!user) return;

    try {
      let query = supabase
        .from('crm_email_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (messageType) {
        query = query.eq('message_type', messageType);
      }

      const { data, error } = await query;
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Messages Error",
        description: "Failed to fetch email messages",
        variant: "destructive"
      });
    }
  };

  // Fetch user's email settings
  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('crm_email_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        // Create default settings if none exist
        const { data: newSettings, error: createError } = await supabase
          .from('crm_email_settings')
          .insert({
            user_id: user.id,
            enable_tracking: true,
            enable_notifications: true,
            auto_sync_enabled: false, // Disable auto-sync by default
            sync_frequency_minutes: 30, // Increase to 30 minutes
            settings: {}
          })
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings);
      } else {
        // Force disable auto-sync for existing users to stop persistent syncing
        if (data.auto_sync_enabled) {
          const { data: updatedSettings, error: updateError } = await supabase
            .from('crm_email_settings')
            .update({ auto_sync_enabled: false })
            .eq('user_id', user.id)
            .select()
            .single();
          
          if (!updateError) {
            setSettings(updatedSettings);
          } else {
            setSettings(data);
          }
        } else {
          setSettings(data);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Settings Error",
        description: "Failed to fetch email settings",
        variant: "destructive"
      });
    }
  };

  // Connect to Microsoft 365
  const connectMicrosoft365 = async () => {
    if (!user) return;

    setIsConnecting(true);
    try {
      // Check if user has @easeworks.com email
      const userEmail = user.email;
      if (!userEmail?.endsWith('@easeworks.com')) {
        toast({
          title: "Access Denied",
          description: "Only @easeworks.com email addresses are allowed to connect to Microsoft 365",
          variant: "destructive"
        });
        return;
      }

      // Call edge function to initiate OAuth flow
      const { data, error } = await supabase.functions.invoke('microsoft-oauth-connect', {
        body: { action: 'initiate' }
      });

      if (error) throw error;

      if (data?.authUrl) {
        // Redirect to Microsoft OAuth
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error connecting to Microsoft 365:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Microsoft 365. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect from Microsoft 365
  const disconnectMicrosoft365 = async () => {
    if (!user || !connection) return;

    try {
      const { error } = await supabase
        .from('crm_email_connections')
        .update({ 
          connection_status: 'revoked',
          access_token_encrypted: null,
          refresh_token_encrypted: null 
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setConnection({ ...connection, connection_status: 'revoked' });
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from Microsoft 365",
      });
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect from Microsoft 365",
        variant: "destructive"
      });
    }
  };

  // Send email
  const sendEmail = async (emailData: {
    to: Array<{ email: string; name?: string }>;
    cc?: Array<{ email: string; name?: string }>;
    bcc?: Array<{ email: string; name?: string }>;
    subject: string;
    body: string;
    isHtml?: boolean;
    enableTracking?: boolean;
  }) => {
    if (!user || connection?.connection_status !== 'connected') {
      toast({
        title: "Not Connected",
        description: "Please connect to Microsoft 365 first",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('microsoft-send-email', {
        body: emailData
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: "Your email has been sent successfully",
      });

      // Refresh messages
      await fetchMessages();
      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send email. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Sync emails from Microsoft 365
  const syncEmails = async (showToast: boolean = true) => {
    if (connection?.connection_status !== 'connected') {
      console.log('Not connected to Microsoft 365, skipping sync');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('microsoft-sync-emails');
      
      if (error) throw error;
      
      console.log('Email sync completed:', data);
      
      // Refresh messages after sync
      await fetchMessages();
      
      // Only show toast for manual syncs, not automatic ones
      if (showToast) {
        toast({
          title: "Emails Synced",
          description: `Synced ${data?.inboxCount || 0} inbox and ${data?.sentCount || 0} sent emails`,
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error syncing emails:', error);
      if (showToast) {
        toast({
          title: "Sync Failed",
          description: "Failed to sync emails from Microsoft 365",
          variant: "destructive"
        });
      }
    }
  };

  // Update settings
  const updateSettings = async (newSettings: Partial<EmailSettings>) => {
    if (!user || !settings) return;

    try {
      const { data, error } = await supabase
        .from('crm_email_settings')
        .update(newSettings)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setSettings(data);
      
      toast({
        title: "Settings Updated",
        description: "Your email settings have been updated",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update settings",
        variant: "destructive"
      });
    }
  };

  // Delete email (mark as deleted)
  const deleteEmail = async (messageId: string) => {
    if (!user) return;

    console.log('🗑️ Attempting to delete email:', messageId);
    try {
      const { error } = await supabase
        .from('crm_email_messages')
        .update({ 
          message_type: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('id', messageId);

      if (error) {
        console.error('❌ Delete error:', error);
        throw error;
      }

      console.log('✅ Successfully deleted email');
      // Update local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      toast({
        title: "Email Deleted",
        description: "Email has been moved to trash",
      });
    } catch (error) {
      console.error('Error deleting email:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete email",
        variant: "destructive"
      });
    }
  };

  // Archive email
  const archiveEmail = async (messageId: string) => {
    if (!user) return;

    console.log('📦 Attempting to archive email:', messageId);
    try {
      const { error } = await supabase
        .from('crm_email_messages')
        .update({ 
          message_type: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('id', messageId);

      if (error) {
        console.error('❌ Archive error:', error);
        throw error;
      }

      console.log('✅ Successfully archived email');
      // Update local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      toast({
        title: "Email Archived",
        description: "Email has been archived",
      });
    } catch (error) {
      console.error('Error archiving email:', error);
      toast({
        title: "Archive Failed",
        description: "Failed to archive email",
        variant: "destructive"
      });
    }
  };

  // Mark email as read/unread
  const markAsRead = async (messageId: string, isRead: boolean = true) => {
    if (!user) return;

    console.log('📧 Attempting to mark email as read:', messageId, isRead);
    try {
      const { error } = await supabase
        .from('crm_email_messages')
        .update({ 
          is_read: isRead,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('id', messageId);

      if (error) {
        console.error('❌ Error marking as read:', error);
        throw error;
      }

      console.log('✅ Successfully marked email as read');
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: isRead } : msg
      ));
    } catch (error) {
      console.error('Error updating read status:', error);
    }
  };

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          fetchConnection(),
          fetchMessages(),
          fetchSettings()
        ]);
        
        // Auto-check and refresh tokens if needed
        try {
          const { data, error } = await supabase.functions.invoke('check-token-expiry');
          if (error) {
            console.error('Token check failed:', error);
          } else if (data?.needsRefresh) {
            console.log('Token refresh initiated automatically');
            // Refresh connection data after token refresh
            setTimeout(() => fetchConnection(), 2000);
          }
        } catch (error) {
          console.error('Error checking token expiry:', error);
        }
        
        setLoading(false);
      };
      loadData();
    }
  }, [user]);

  // Auto-sync emails periodically (currently disabled by default)
  useEffect(() => {
    if (!user || !connection || !settings) return;
    
    if (connection.connection_status === 'connected' && settings.auto_sync_enabled) {
      const interval = setInterval(() => {
        syncEmails(false); // Don't show toast for automatic syncs
      }, (settings.sync_frequency_minutes || 30) * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [user, connection, settings]);

  return {
    // State
    connection,
    messages,
    settings,
    loading,
    isConnecting,
    
    // Actions
    connectMicrosoft365,
    disconnectMicrosoft365,
    sendEmail,
    updateSettings,
    fetchMessages,
    syncEmails,
    deleteEmail,
    archiveEmail,
    markAsRead,
    
    // Helper
    isConnected: connection?.connection_status === 'connected',
    canConnect: user?.email?.endsWith('@easeworks.com') || false
  };
}