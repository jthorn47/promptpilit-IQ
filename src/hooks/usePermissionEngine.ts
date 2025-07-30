import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { permissionEngine, AccessContext, PermissionCheckResult } from '@/services/PermissionEngine';
import { logger } from '@/lib/logger';

export interface UsePermissionEngineReturn {
  // Core permission checking
  canAccess: (feature: string, action?: string, context?: AccessContext) => Promise<boolean>;
  canAccessSync: (feature: string, action?: string) => boolean;
  
  // Role checking (backward compatibility)
  hasRole: (role: string) => Promise<boolean>;
  hasAnyRole: (roles: string[]) => Promise<boolean>;
  
  // Feature-specific checks
  canManageUsers: boolean;
  canViewUsers: boolean;
  canManagePermissions: boolean;
  canViewReports: boolean;
  canManageCases: boolean;
  canAssignTraining: boolean;
  canManageVault: boolean;
  canViewVault: boolean;
  canManageSystem: boolean;
  canViewAnalytics: boolean;
  
  // Module access
  assignedModules: string[];
  hasModuleAccess: (module: string) => boolean;
  
  // Debugging
  getLastPermissionCheck: () => PermissionCheckResult | null;
  clearPermissionCache: () => void;
  
  // Loading states
  loading: boolean;
  permissionsLoaded: boolean;
}

interface CachedCheck {
  result: boolean;
  timestamp: number;
}

export const usePermissionEngine = (): UsePermissionEngineReturn => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [assignedModules, setAssignedModules] = useState<string[]>([]);
  const [lastPermissionCheck, setLastPermissionCheck] = useState<PermissionCheckResult | null>(null);
  
  // Local cache for synchronous checks
  const [permissionCache, setPermissionCache] = useState<Map<string, CachedCheck>>(new Map());
  const SYNC_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

  // Initialize user permissions on mount
  useEffect(() => {
    if (!user || authLoading) {
      setLoading(false);
      setPermissionsLoaded(false);
      return;
    }

    const initializePermissions = async () => {
      try {
        setLoading(true);
        
        // Pre-cache common permissions for sync access
        const commonChecks = [
          { feature: 'users', action: 'manage' },
          { feature: 'users', action: 'view' },
          { feature: 'permissions', action: 'manage' },
          { feature: 'reports', action: 'view' },
          { feature: 'cases', action: 'manage' },
          { feature: 'training', action: 'assign' },
          { feature: 'vault', action: 'manage' },
          { feature: 'vault', action: 'view' },
          { feature: 'system', action: 'manage' },
          { feature: 'analytics', action: 'view' }
        ];

        const results = await Promise.all(
          commonChecks.map(async ({ feature, action }) => {
            const result = await permissionEngine.canUserAccess(user.id, feature, action);
            return { key: `${feature}:${action}`, allowed: result.allowed };
          })
        );

        // Cache results for sync access
        const newCache = new Map<string, CachedCheck>();
        results.forEach(({ key, allowed }) => {
          newCache.set(key, { result: allowed, timestamp: Date.now() });
        });
        setPermissionCache(newCache);

        // Get assigned modules
        const modules = await permissionEngine.getUserModules(user.id);
        setAssignedModules(modules);

        setPermissionsLoaded(true);
        logger.api.debug('Permissions initialized', { userId: user.id, modules });
      } catch (error) {
        logger.api.error('Failed to initialize permissions', error, { userId: user?.id });
      } finally {
        setLoading(false);
      }
    };

    initializePermissions();
  }, [user, authLoading]);

  // Core permission checking function
  const canAccess = useCallback(async (
    feature: string, 
    action: string = 'view',
    context?: AccessContext
  ): Promise<boolean> => {
    if (!user) {
      logger.api.debug('Permission check: no user', { feature, action });
      return false;
    }

    try {
      const result = await permissionEngine.canUserAccess(user.id, feature, action, context);
      setLastPermissionCheck(result);
      
      // Update cache for sync access
      const cacheKey = `${feature}:${action}`;
      setPermissionCache(prev => new Map(prev.set(cacheKey, {
        result: result.allowed,
        timestamp: Date.now()
      })));

      logger.api.debug('Permission check completed', { 
        userId: user.id, feature, action, allowed: result.allowed, reason: result.reason 
      });
      
      return result.allowed;
    } catch (error) {
      logger.api.error('Permission check failed', error, { userId: user.id, feature, action });
      return false;
    }
  }, [user]);

  // Synchronous permission checking (uses cache)
  const canAccessSync = useCallback((feature: string, action: string = 'view'): boolean => {
    if (!user || !permissionsLoaded) {
      return false;
    }

    const cacheKey = `${feature}:${action}`;
    const cached = permissionCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < SYNC_CACHE_TTL) {
      return cached.result;
    }

    // If not in cache, trigger async check but return false for now
    canAccess(feature, action).catch(error => {
      logger.api.error('Async permission check failed', error, { feature, action });
    });
    
    return false;
  }, [user, permissionsLoaded, permissionCache, canAccess]);

  // Role checking functions (for backward compatibility)
  const hasRole = useCallback(async (role: string): Promise<boolean> => {
    if (!user) return false;
    return permissionEngine.hasRole(user.id, role);
  }, [user]);

  const hasAnyRole = useCallback(async (roles: string[]): Promise<boolean> => {
    if (!user) return false;
    return permissionEngine.hasAnyRole(user.id, roles);
  }, [user]);

  // Module access checking
  const hasModuleAccess = useCallback((module: string): boolean => {
    return assignedModules.includes(module);
  }, [assignedModules]);

  // Cache management
  const clearPermissionCache = useCallback(() => {
    permissionEngine.clearCache();
    setPermissionCache(new Map());
    setPermissionsLoaded(false);
  }, []);

  const getLastPermissionCheck = useCallback((): PermissionCheckResult | null => {
    return lastPermissionCheck;
  }, [lastPermissionCheck]);

  // Memoized feature-specific permission checks
  const featurePermissions = useMemo(() => ({
    canManageUsers: canAccessSync('users', 'manage'),
    canViewUsers: canAccessSync('users', 'view'),
    canManagePermissions: canAccessSync('permissions', 'manage'),
    canViewReports: canAccessSync('reports', 'view'),
    canManageCases: canAccessSync('cases', 'manage'),
    canAssignTraining: canAccessSync('training', 'assign'),
    canManageVault: canAccessSync('vault', 'manage'),
    canViewVault: canAccessSync('vault', 'view'),
    canManageSystem: canAccessSync('system', 'manage'),
    canViewAnalytics: canAccessSync('analytics', 'view')
  }), [canAccessSync]);

  return {
    // Core functions
    canAccess,
    canAccessSync,
    hasRole,
    hasAnyRole,
    
    // Feature permissions
    ...featurePermissions,
    
    // Module access
    assignedModules,
    hasModuleAccess,
    
    // Debugging
    getLastPermissionCheck,
    clearPermissionCache,
    
    // States
    loading: loading || authLoading,
    permissionsLoaded
  };
};