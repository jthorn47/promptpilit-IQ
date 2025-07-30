import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VaultPolicy {
  id: string;
  title: string;
  version: number;
  body: string;
  created_at: string;
  created_by?: string;
  change_summary?: string;
  policy_id: string;
}

export const useVaultPolicies = () => {
  const [policies, setPolicies] = useState<VaultPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userRoles } = useAuth();

  const loadPolicies = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 useVaultPolicies: Starting to load policies', {
        userId: user?.id,
        userEmail: user?.email,
        userRoles,
        hasRequiredRoles: userRoles?.includes('super_admin') || userRoles?.includes('company_admin')
      });

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check permissions first
      if (!userRoles?.includes('super_admin') && !userRoles?.includes('company_admin')) {
        console.warn('🚫 useVaultPolicies: User does not have required permissions', {
          userRoles,
          hasRequiredRole: userRoles?.includes('super_admin') || userRoles?.includes('company_admin')
        });
        setPolicies([]);
        setError('You do not have permission to view policies');
        return;
      }

      let query = supabase
        .from('hroiq_policy_versions')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('🔍 useVaultPolicies: Executing query');

      const { data, error: supabaseError } = await query;

      console.log('🔍 useVaultPolicies: Query result', {
        dataCount: data?.length || 0,
        error: supabaseError,
        firstItem: data?.[0]
      });

      if (supabaseError) {
        console.error('❌ useVaultPolicies: Supabase error:', supabaseError);
        throw supabaseError;
      }

      setPolicies(data || []);
      console.log('✅ useVaultPolicies: Policies loaded successfully', data?.length || 0);

    } catch (err) {
      console.error('❌ useVaultPolicies: Error loading policies:', err);
      setError(err instanceof Error ? err.message : 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useVaultPolicies: Effect triggered', {
      user: !!user,
      userEmail: user?.email,
      userRoles,
      hasRequiredRoles: userRoles?.includes('super_admin') || userRoles?.includes('company_admin'),
      userRole: (user as any)?.user_metadata?.roles
    });

    if (user && (userRoles?.includes('super_admin') || userRoles?.includes('company_admin'))) {
      loadPolicies();
    } else if (user) {
      console.warn('🚫 useVaultPolicies: User authenticated but lacks permissions', {
        userRoles,
        userMetadataRoles: (user as any)?.user_metadata?.roles
      });
      setError('You do not have permission to view policies');
      setLoading(false);
    } else {
      console.log('⏳ useVaultPolicies: Waiting for user authentication');
    }
  }, [user, userRoles]);

  return {
    policies,
    loading,
    error,
    refetch: loadPolicies,
    canManage: userRoles?.includes('super_admin') || userRoles?.includes('company_admin')
  };
};