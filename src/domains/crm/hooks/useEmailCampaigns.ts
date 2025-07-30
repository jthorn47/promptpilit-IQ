import { useState, useEffect } from 'react';
import { crmAPI } from '../api';
import { EmailCampaign } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useEmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await crmAPI.getEmailCampaigns();
      setCampaigns(data);
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