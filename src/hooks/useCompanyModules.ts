import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CompanyModules {
  modules_enabled: string[];
}

export const useCompanyModules = () => {
  const [modules, setModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { companyId, userRoles } = useAuth();

  const fetchCompanyModules = async () => {
    // Super admin users get all modules
    if (userRoles?.includes('super_admin')) {
      console.log('🔐 Super admin detected, enabling all modules');
      setModules(['training', 'crm', 'payroll', 'hr', 'assessments', 'lms']);
      setLoading(false);
      return;
    }

    if (!companyId) {
      console.log('🏢 No company ID, skipping module fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('🏢 Fetching company modules for:', companyId);
      const { data, error } = await supabase
        .from('company_settings')
        .select('modules_enabled')
        .eq('id', companyId)
        .single();

      if (error) {
        console.error('❌ Error fetching company modules:', error);
        throw error;
      }

      const enabledModules = data?.modules_enabled || ['training'];
      console.log('✅ Company modules fetched:', enabledModules);
      setModules(enabledModules);
    } catch (error) {
      console.error('❌ Error in fetchCompanyModules:', error);
      setModules(['training']); // Fallback to default
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyModules();
  }, [companyId, userRoles]);

  return {
    modules,
    loading,
    refetch: fetchCompanyModules
  };
};