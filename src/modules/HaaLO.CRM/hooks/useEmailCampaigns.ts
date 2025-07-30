import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EmailCampaign } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useEmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      // Mock data for email campaigns
      const mockCampaigns: EmailCampaign[] = [
        {
          id: '1',
          name: 'Q4 Product Launch',
          subject: 'Exciting new product announcement!',
          template_id: '1',
          status: 'sent',
          sent_count: 1500,
          opened_count: 750,
          clicked_count: 150,
          bounced_count: 25,
          sent_at: new Date().toISOString(),
          created_by: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Newsletter December',
          subject: 'Monthly Newsletter - December 2024',
          template_id: '2',
          status: 'draft',
          sent_count: 0,
          opened_count: 0,
          clicked_count: 0,
          bounced_count: 0,
          created_by: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
      
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Error fetching email campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return {
    campaigns,
    loading,
    fetchCampaigns,
  };
};