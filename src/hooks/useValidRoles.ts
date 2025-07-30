
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface ValidRole {
  value: string;
  label: string;
}

// Fallback roles in case database query fails
const FALLBACK_ROLES: ValidRole[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'company_admin', label: 'Company Admin' },
  { value: 'learner', label: 'Employee/Learner' },
  { value: 'admin', label: 'Admin' },
  { value: 'client_admin', label: 'Client Admin' }
];

export const useValidRoles = () => {
  const [roles, setRoles] = useState<ValidRole[]>(FALLBACK_ROLES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchValidRoles = async () => {
      try {
        logger.api.info('Fetching valid roles from database');
        
        // Query the PostgreSQL enum values for app_role
        const { data, error } = await supabase
          .rpc('get_enum_values', { enum_name: 'app_role' });

        if (error) {
          logger.api.warn('Failed to fetch roles from database, using fallback', error);
          setError('Using fallback roles');
          setRoles(FALLBACK_ROLES);
        } else if (data && Array.isArray(data)) {
          const fetchedRoles: ValidRole[] = data.map((role: string) => ({
            value: role,
            label: role.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')
          }));
          
          logger.api.info('Successfully fetched roles from database', { roles: fetchedRoles });
          setRoles(fetchedRoles);
          setError(null);
        } else {
          logger.api.warn('Unexpected response format for roles, using fallback', { data });
          setError('Unexpected response format');
          setRoles(FALLBACK_ROLES);
        }
      } catch (err) {
        logger.api.error('Exception while fetching roles', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setRoles(FALLBACK_ROLES);
      } finally {
        setLoading(false);
      }
    };

    fetchValidRoles();
  }, []);

  return { roles, loading, error };
};
