import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserRole {
  user_id: string;
  role: string;
  company_id?: string;
}

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          setUserRole(data);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  const isSuperAdmin = userRole?.role === 'super_admin';
  const isCompanyAdmin = userRole?.role === 'company_admin';
  const isClientAdmin = userRole?.role === 'client_admin';
  const isAdmin = userRole?.role === 'admin';

  return {
    userRole,
    loading,
    isSuperAdmin,
    isCompanyAdmin,
    isClientAdmin,
    isAdmin
  };
};