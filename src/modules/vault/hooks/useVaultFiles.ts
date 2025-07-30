import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VaultFile {
  id: string;
  name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  company_id?: string;
  folder_path: string;
  checksum?: string;
  created_at: string;
  updated_at: string;
  version?: number;
  is_shared?: boolean;
  download_count?: number;
  last_accessed_at?: string;
  tags?: string[];
  description?: string;
}

export const useVaultFiles = () => {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin, isSuperAdmin, isCompanyAdmin } = useAuth();

  console.log('🗂️ useVaultFiles: Hook initialized', {
    userId: user?.id,
    userEmail: user?.email,
    isAdmin,
    isSuperAdmin,
    isCompanyAdmin,
    hasUser: !!user
  });

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 useVaultFiles: Starting to load files', {
        userId: user?.id,
        userEmail: user?.email,
        isAdmin,
        isSuperAdmin,
        isCompanyAdmin
      });

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check permissions first
      if (!isAdmin && !isSuperAdmin && !isCompanyAdmin) {
        console.warn('🚫 useVaultFiles: User does not have required permissions');
        setFiles([]);
        setError('You do not have permission to view vault files');
        setLoading(false);
        return;
      }

      let query = supabase
        .from('vault_files')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('🔍 useVaultFiles: Executing query');

      const { data, error: supabaseError } = await query;

      console.log('🔍 useVaultFiles: Query result', {
        dataCount: data?.length || 0,
        error: supabaseError,
        firstItem: data?.[0]
      });

      if (supabaseError) {
        console.error('❌ useVaultFiles: Supabase error:', supabaseError);
        throw supabaseError;
      }

      setFiles(data || []);
      console.log('✅ useVaultFiles: Files loaded successfully', data?.length || 0);

    } catch (err) {
      console.error('❌ useVaultFiles: Error loading files:', err);
      setError(err instanceof Error ? err.message : 'Failed to load vault files');
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (id: string) => {
    try {
      console.log('🗑️ useVaultFiles: Deleting file', id);
      
      const { error } = await supabase
        .from('vault_files')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Refresh the files list
      await loadFiles();
      return true;
    } catch (err) {
      console.error('❌ useVaultFiles: Error deleting file:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete file');
      return false;
    }
  };

  const downloadFile = async (file: VaultFile) => {
    try {
      console.log('📥 useVaultFiles: Getting download URL for file', file.id);

      const { data } = supabase.storage
        .from('vault')
        .getPublicUrl(file.file_path);

      // Update download count
      await supabase
        .from('vault_files')
        .update({ 
          download_count: (file.download_count || 0) + 1,
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', file.id);

      return data.publicUrl;
    } catch (err) {
      console.error('❌ useVaultFiles: Error getting download URL:', err);
      throw err;
    }
  };

  useEffect(() => {
    console.log('🔄 useVaultFiles: Effect triggered', {
      user: !!user,
      userEmail: user?.email,
      isAdmin,
      isSuperAdmin,
      isCompanyAdmin
    });

    if (user && (isAdmin || isSuperAdmin || isCompanyAdmin)) {
      loadFiles();
    } else if (user) {
      console.warn('🚫 useVaultFiles: User authenticated but lacks permissions');
      setError('You do not have permission to view vault files');
      setLoading(false);
    } else {
      console.log('⏳ useVaultFiles: Waiting for user authentication');
    }
  }, [user, isAdmin, isSuperAdmin, isCompanyAdmin]);

  return {
    files,
    loading,
    error,
    refetch: loadFiles,
    deleteFile,
    downloadFile,
    canManage: isAdmin || isSuperAdmin || isCompanyAdmin,
    canUpload: isAdmin || isSuperAdmin || isCompanyAdmin
  };
};