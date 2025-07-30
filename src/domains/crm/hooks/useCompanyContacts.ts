import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch company contacts with optional filtering
 */
export function useCompanyContacts(options: {
  companyId?: string;
  isPrimary?: boolean;
  status?: string;
  limit?: number;
  page?: number;
  search?: string;
} = {}) {
  const { companyId, isPrimary, status, limit = 10, page = 0, search } = options;
  
  return useSupabaseQuery(
    ['company-contacts', companyId, isPrimary ? 'true' : 'false', status, String(limit), String(page), search],
    async () => {
      let query = supabase
        .from('company_contacts')
        .select('*, company:company_id(id, company_name)');
      
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      
      if (isPrimary !== undefined) {
        query = query.eq('is_primary', isPrimary);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
      }
      
      return query
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);
    },
    {}
  );
}