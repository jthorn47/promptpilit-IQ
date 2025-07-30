import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

export function useCompanySettings(id: string) {
  return useSupabaseQuery(
    ['company-settings', id],
    async () => {
      return supabase
        .from('company_settings')
        .select('*')
        .eq('id', id)
        .maybeSingle();
    },
    { enabled: !!id }
  );
}