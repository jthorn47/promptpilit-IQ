import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VaultLegalNotice {
  id: string;
  title: string;
  content: string;
  clause_type: string;
  applicable_documents?: string[];
  jurisdiction?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useVaultLegalNotices = () => {
  const [notices, setNotices] = useState<VaultLegalNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin, isSuperAdmin } = useAuth();

  const loadNotices = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('legal_clauses')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        throw supabaseError;
      }

      setNotices(data || []);
    } catch (err) {
      console.error('Error loading legal notices:', err);
      setError(err instanceof Error ? err.message : 'Failed to load legal notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (isAdmin || isSuperAdmin)) {
      loadNotices();
    }
  }, [user, isAdmin, isSuperAdmin]);

  return {
    notices,
    loading,
    error,
    refetch: loadNotices,
    canManage: isAdmin || isSuperAdmin
  };
};