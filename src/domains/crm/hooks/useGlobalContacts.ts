import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { CrmContact } from './useCrmContacts';

export interface GlobalContactFilters {
  search?: string;
  companyId?: string;
  title?: string;
  assignedRep?: string;
  isPrimary?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'company' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

export interface ContactWithCompany extends CrmContact {
  company?: {
    id: string;
    name: string;
    assigned_rep_id: string;
  };
}

export function useGlobalContacts(filters: GlobalContactFilters = {}) {
  const {
    search,
    companyId,
    title,
    assignedRep,
    isPrimary,
    page = 0,
    pageSize = 20,
    sortBy = 'updated_at',
    sortOrder = 'desc'
  } = filters;

  return useSupabaseQuery(
    ['global-contacts', JSON.stringify(filters)],
    async () => {
      let query = supabase
        .from('crm_contacts')
        .select(`
          *,
          company:crm_companies(
            id,
            name,
            assigned_rep_id
          )
        `, { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.or(
          `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
        );
      }

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      if (title) {
        query = query.eq('title', title);
      }

      if (isPrimary !== undefined) {
        query = query.eq('is_primary_contact', isPrimary);
      }

      // Note: Can't filter by assigned_rep directly in joined table with current query structure
      // This would need to be handled client-side or with a different query approach

      // Apply sorting
      const sortColumn = sortBy === 'name' ? 'first_name' : 'updated_at';
      query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      
      if (error) throw error;

      return {
        data: {
          contacts: data as ContactWithCompany[],
          totalCount: count || 0,
          hasMore: (count || 0) > (page + 1) * pageSize
        },
        error: null
      };
    }
  );
}

// Hook for getting unique filter values
export function useContactFilterOptions() {
  return useSupabaseQuery(
    ['contact-filter-options'],
    async () => {
      // Get unique titles
      const { data: titleData } = await supabase
        .from('crm_contacts')
        .select('title')
        .not('title', 'is', null)
        .order('title');

      // Get unique assigned reps from companies
      const { data: repData } = await supabase
        .from('crm_companies')
        .select('assigned_rep_id')
        .not('assigned_rep_id', 'is', null)
        .order('assigned_rep_id');

      // Get companies for filter dropdown
      const { data: companyData } = await supabase
        .from('crm_companies')
        .select('id, name')
        .order('name');

      const uniqueTitles = [...new Set(titleData?.map(item => item.title).filter(Boolean))];
      const uniqueReps = [...new Set(repData?.map(item => item.assigned_rep_id).filter(Boolean))];

      return {
        data: {
          titles: uniqueTitles,
          assignedReps: uniqueReps,
          companies: companyData || []
        },
        error: null
      };
    }
  );
}