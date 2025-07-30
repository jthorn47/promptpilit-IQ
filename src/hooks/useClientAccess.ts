import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserRoles = () => {
  return useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_roles')
        .select('role, company_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    }
  });
};

export const useHasClientAccess = (clientId: string) => {
  const { data: roles } = useUserRoles();
  
  if (!roles) return false;
  
  // Super admins have access to all clients
  if (roles.some(role => role.role === 'super_admin')) {
    return true;
  }
  
  // Company admins have access to their company's client
  return roles.some(role => 
    role.role === 'company_admin' && role.company_id === clientId
  );
};