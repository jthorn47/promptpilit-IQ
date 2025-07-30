
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ModuleAccess {
  hasAccess: boolean;
  isEnabled: boolean;
  setupCompleted: boolean;
}

export const useModuleAccess = (moduleId: string) => {
  const { user, userRoles } = useAuth();

  return useQuery({
    queryKey: ['module-access', moduleId, user?.id],
    queryFn: async (): Promise<ModuleAccess> => {
      if (!user) {
        return { hasAccess: false, isEnabled: false, setupCompleted: false };
      }

      // Super admin users have access to all modules
      if (userRoles?.includes('super_admin')) {
        return { hasAccess: true, isEnabled: true, setupCompleted: true };
      }

      // Get user's company from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.company_id) {
        return { hasAccess: false, isEnabled: false, setupCompleted: false };
      }

      // Check if company has access to this module
      const { data: moduleAccess } = await supabase
        .from('client_module_access')
        .select('is_enabled')
        .eq('module_id', moduleId)
        .eq('module_type', 'platform')
        .single();

      if (!moduleAccess) {
        return { hasAccess: false, isEnabled: false, setupCompleted: false };
      }

      return {
        hasAccess: true,
        isEnabled: moduleAccess.is_enabled,
        setupCompleted: false
      };
    },
    enabled: !!user,
  });
};
