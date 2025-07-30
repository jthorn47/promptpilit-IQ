import { useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  company_id?: string;
  department?: string;
  job_title?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

interface UserData {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
}

interface UserPermissions {
  roles: string[];
  permissions: string[];
  modules: string[];
  companyId: string | null;
  companyName: string | null;
}

interface UserState {
  // Core user data
  data: UserData;
  
  // Permission data
  permissions: UserPermissions;
  
  // Role checks
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
  isClientAdmin: boolean;
  isManager: boolean;
  isUser: boolean;
  isLearner: boolean;
  isAdmin: boolean;
  
  // Permission checks
  canManageUsers: boolean;
  canManageSystem: boolean;
  canViewAnalytics: boolean;
  canManageCompanies: boolean;
  canAccessAdmin: boolean;
  
  // Utility functions
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasModuleAccess: (module: string) => boolean;
  
  // Actions
  refreshProfile: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

/**
 * Unified user hook that consolidates all user-related data and operations
 * Provides consistent loading states, error handling, and data access patterns
 */
export const useUser = (): UserState => {
  const { 
    user, 
    loading: authLoading, 
    userRole, 
    companyId, 
    companyName,
    userRoles,
    userPermissions,
    companyModules
  } = useAuth();
  
  const {
    canManageUsers,
    canManageSystem,
    canViewAnalytics,
    hasRole: permissionHasRole,
    hasAnyRole: permissionHasAnyRole,
    loading: permissionLoading
  } = usePermissionContext();

  // Fetch user profile with react-query for caching and error handling
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refreshProfile
  } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user ID available');
      
      logger.debug('Fetching user profile', { userId: user.id, context: 'user' });
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        logger.error('Failed to fetch user profile', { error, context: 'user' });
        throw error;
      }
      
      logger.debug('User profile fetched successfully', { profile: data, context: 'user' });
      return data as UserProfile;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) throw new Error('No user ID available');
    
    logger.debug('Updating user profile', { userId: user.id, updates, context: 'user' });
    
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
    
    if (error) {
      logger.error('Failed to update user profile', { error, context: 'user' });
      throw error;
    }
    
    // Refresh the profile after update
    refreshProfile();
    logger.debug('User profile updated successfully', { context: 'user' });
  };

  // Compute derived state with memoization
  const userState = useMemo(() => {
    const loading = authLoading || permissionLoading || profileLoading;
    const error = profileError as Error | null;
    
    // Core role checks
    const roles = userRoles || [];
    const isSuperAdmin = roles.includes('super_admin');
    const isCompanyAdmin = roles.includes('company_admin');
    const isClientAdmin = roles.includes('client_admin');
    const isManager = roles.includes('manager');
    const isUser = roles.includes('user');
    const isLearner = roles.includes('learner');
    const isAdmin = isSuperAdmin || isCompanyAdmin || isClientAdmin;
    
    // Enhanced role checking functions
    const hasRole = (role: string): boolean => {
      return roles.includes(role);
    };
    
    const hasAnyRole = (checkRoles: string[]): boolean => {
      return checkRoles.some(role => roles.includes(role));
    };
    
    const hasAllRoles = (checkRoles: string[]): boolean => {
      return checkRoles.every(role => roles.includes(role));
    };
    
    const hasPermission = (permission: string): boolean => {
      return userPermissions?.some(p => p.permission_name === permission) ?? false;
    };
    
    const hasModuleAccess = (module: string): boolean => {
      return companyModules?.includes(module) ?? false;
    };
    
    return {
      // Core user data
      data: {
        user,
        profile: profile || null,
        loading,
        error
      },
      
      // Permission data
      permissions: {
        roles,
        permissions: userPermissions?.map(p => p.permission_name) || [],
        modules: companyModules || [],
        companyId,
        companyName
      },
      
      // Role checks
      isSuperAdmin,
      isCompanyAdmin,
      isClientAdmin,
      isManager,
      isUser,
      isLearner,
      isAdmin,
      
      // Permission checks (prioritize permission engine)
      canManageUsers: canManageUsers || isSuperAdmin,
      canManageSystem: canManageSystem || isSuperAdmin,
      canViewAnalytics: canViewAnalytics || isSuperAdmin || isCompanyAdmin,
      canManageCompanies: isSuperAdmin,
      canAccessAdmin: isSuperAdmin || isCompanyAdmin || isManager,
      
      // Utility functions
      hasRole,
      hasAnyRole,
      hasAllRoles,
      hasPermission,
      hasModuleAccess,
      
      // Actions
      refreshProfile,
      updateProfile
    };
  }, [
    user, 
    profile, 
    authLoading, 
    permissionLoading, 
    profileLoading, 
    profileError,
    userRoles,
    userPermissions,
    companyModules,
    companyId,
    companyName,
    canManageUsers,
    canManageSystem,
    canViewAnalytics,
    refreshProfile
  ]);

  return userState;
};