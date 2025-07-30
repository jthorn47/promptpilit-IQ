import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

export function useContactPermissions(contactId?: string, companyId?: string) {
  return useSupabaseQuery(
    ['contact-permissions', contactId, companyId],
    async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: { canView: false, canEdit: false, canDelete: false }, error: null };

      // Check user roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role, company_id')
        .eq('user_id', user.id);

      if (!roles) return { data: { canView: false, canEdit: false, canDelete: false }, error: null };

      // Super admin has all permissions
      const isSuperAdmin = roles.some(role => role.role === 'super_admin');
      if (isSuperAdmin) {
        return { data: { canView: true, canEdit: true, canDelete: true }, error: null };
      }

      // Company admin has permissions for their company contacts
      const isCompanyAdmin = roles.some(role => 
        role.role === 'company_admin' && 
        (!companyId || role.company_id === companyId)
      );

      if (isCompanyAdmin) {
        return { data: { canView: true, canEdit: true, canDelete: true }, error: null };
      }

      // Internal staff can view and edit but not delete
      const isInternalStaff = roles.some(role => role.role === 'internal_staff');
      if (isInternalStaff) {
        return { data: { canView: true, canEdit: true, canDelete: false }, error: null };
      }

      return { data: { canView: false, canEdit: false, canDelete: false }, error: null };
    },
    {
      enabled: !!contactId || !!companyId
    }
  );
}

export function useCanAccessCompany(companyId: string) {
  return useSupabaseQuery(
    ['can-access-company', companyId],
    async () => {
      if (!companyId) return { data: false, error: null };

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: false, error: null };

      // Check if user has CRM access to this company
      const { data, error } = await supabase.rpc('has_crm_access', {
        _user_id: user.id,
        _company_id: companyId
      });

      if (error) {
        console.error('Error checking company access:', error);
        return { data: false, error: error };
      }

      return { data: data || false, error: null };
    },
    {
      enabled: !!companyId
    }
  );
}