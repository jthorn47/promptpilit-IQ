import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PolicyVersion {
  id: string;
  policy_id: string;
  version: number;
  title: string;
  body: string;
  created_by?: string;
  created_at: string;
  change_summary?: string;
}

export const useHROIQPolicyVersions = (policyId?: string) => {
  const { data: versions, isLoading } = useQuery({
    queryKey: ['hroiq-policy-versions', policyId],
    queryFn: async () => {
      if (!policyId) return [];

      const { data, error } = await supabase
        .from('hroiq_policy_versions')
        .select('*')
        .eq('policy_id', policyId)
        .order('version', { ascending: false });

      if (error) throw error;
      return data as PolicyVersion[];
    },
    enabled: !!policyId,
  });

  return {
    versions: versions || [],
    isLoading,
  };
};