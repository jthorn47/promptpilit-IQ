import { useState, useEffect } from 'react';
import { crmAPI } from '../api';
import { EmailTemplate } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await crmAPI.getEmailTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    fetchTemplates,
  };
};