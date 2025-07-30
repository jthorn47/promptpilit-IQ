import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useSupabaseMutation } from '@/hooks/useSupabaseMutation';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export interface CrmContact {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile_phone?: string;
  direct_line?: string;
  title?: string;
  department?: string;
  assistant_name?: string;
  assistant_phone?: string;
  is_primary_contact?: boolean;
  is_active?: boolean;
  preferred_contact_method?: string;
  linkedin_url?: string;
  timezone?: string;
  last_contacted_at?: string;
  notes?: string;
  tags?: string[];
  custom_fields?: any;
  created_at: string;
  updated_at: string;
}

export function useCrmContacts(filters?: {
  companyId?: string;
  isPrimary?: boolean;
  search?: string;
}) {
  return useSupabaseQuery(
    ['crm-contacts', JSON.stringify(filters)],
    async () => {
      let query = supabase
        .from('crm_contacts')
        .select('*');

      if (filters?.companyId) {
        query = query.eq('company_id', filters.companyId);
      }

      if (filters?.isPrimary !== undefined) {
        query = query.eq('is_primary_contact', filters.isPrimary);
      }

      if (filters?.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      return query.order('is_primary_contact', { ascending: false });
    }
  );
}