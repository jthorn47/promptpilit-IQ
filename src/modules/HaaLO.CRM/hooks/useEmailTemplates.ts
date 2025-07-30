import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EmailTemplate } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      // Mock data for email templates
      const mockTemplates: EmailTemplate[] = [
        {
          id: '1',
          name: 'Welcome Email',
          subject: 'Welcome to our service!',
          body: 'Thank you for joining us...',
          template_type: 'welcome',
          is_active: true,
          created_by: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Follow-up Email',
          subject: 'Following up on your inquiry',
          body: 'We wanted to follow up...',
          template_type: 'follow_up',
          is_active: true,
          created_by: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
      
      setTemplates(mockTemplates);
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