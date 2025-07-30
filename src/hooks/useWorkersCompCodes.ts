import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WorkersCompCode {
  id: string;
  code: string;
  description: string;
  base_rate?: number;
  industry?: string;
  hazard_group?: string;
  created_at: string;
  updated_at: string;
}

export const useWorkersCompCodes = () => {
  const [workersCompCodes, setWorkersCompCodes] = useState<WorkersCompCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchWorkersCompCodes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('workers_comp_codes')
        .select('*')
        .order('code');

      if (fetchError) throw fetchError;

      setWorkersCompCodes(data || []);
    } catch (err) {
      console.error('Error fetching workers comp codes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch workers comp codes');
      toast({
        title: "Error",
        description: "Failed to load workers compensation codes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkersCompCodes();
  }, []);

  return {
    workersCompCodes,
    loading,
    error,
    refetch: fetchWorkersCompCodes,
  };
};