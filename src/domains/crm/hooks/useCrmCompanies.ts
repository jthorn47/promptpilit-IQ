import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useSupabaseMutation } from '@/hooks/useSupabaseMutation';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Database } from '@/integrations/supabase/types';

export interface CrmCompany {
  id: string;
  name: string;
  business_description?: string;
  industry?: string;
  employee_count?: number;
  annual_revenue?: number;
  website?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  assigned_rep_id?: string;
  lead_source?: string;
  risk_score?: number;
  last_activity_date?: string;
  next_follow_up_date?: string;
  phone?: string;
  email?: string;
  notes?: string;
  tags?: string[];
  custom_fields?: any;
  status?: Database['public']['Enums']['company_status'];
  type?: Database['public']['Enums']['company_type'];
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyData {
  name: string;
  business_description?: string;
  industry?: string;
  employee_count?: number;
  annual_revenue?: number;
  website?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  assigned_rep_id?: string;
  lead_source?: string;
  phone?: string;
  email?: string;
  notes?: string;
  tags?: string[];
  custom_fields?: any;
  status?: Database['public']['Enums']['company_status'];
  type?: Database['public']['Enums']['company_type'];
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  id: string;
}

export function useCrmCompanies(filters?: {
  assignedRepId?: string;
  industry?: string;
  riskScore?: { min?: number; max?: number };
  search?: string;
}) {
  return useSupabaseQuery(
    ['crm-companies', JSON.stringify(filters)],
    async () => {
      let query = supabase
        .from('crm_companies')
        .select('*');

      if (filters?.assignedRepId) {
        query = query.eq('assigned_rep_id', filters.assignedRepId);
      }

      if (filters?.industry) {
        query = query.eq('industry', filters.industry);
      }

      if (filters?.riskScore?.min !== undefined) {
        query = query.gte('risk_score', filters.riskScore.min);
      }

      if (filters?.riskScore?.max !== undefined) {
        query = query.lte('risk_score', filters.riskScore.max);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,business_description.ilike.%${filters.search}%`);
      }

      return query.order('updated_at', { ascending: false });
    }
  );
}

export function useCrmCompany(id: string) {
  return useSupabaseQuery(
    ['crm-company', id],
    async () => {
      return supabase
        .from('crm_companies')
        .select('*')
        .eq('id', id)
        .maybeSingle();
    },
    { enabled: !!id }
  );
}

export function useCrmCompanyMutations() {
  const queryClient = useQueryClient();

  const createCompany = useSupabaseMutation(
    async (data: CreateCompanyData) => {
      return supabase
        .from('crm_companies')
        .insert(data)
        .select()
        .single();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['crm-companies'] });
      },
    }
  );

  const updateCompany = useSupabaseMutation(
    async (data: UpdateCompanyData) => {
      const { id, ...updateData } = data;
      return supabase
        .from('crm_companies')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['crm-companies'] });
        queryClient.invalidateQueries({ queryKey: ['crm-company', data?.id] });
      },
    }
  );

  const deleteCompany = useSupabaseMutation(
    async (id: string) => {
      return supabase
        .from('crm_companies')
        .delete()
        .eq('id', id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['crm-companies'] });
      },
    }
  );

  return {
    createCompany,
    updateCompany,
    deleteCompany,
  };
}