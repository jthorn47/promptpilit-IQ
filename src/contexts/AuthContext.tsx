
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserPermission {
  permission_name: string;
  description: string;
  resource: string;
  action: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  companyId: string | null;
  companyName: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  justLoggedOut: boolean;
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
  isClientAdmin: boolean;
  userRoles: string[];
  isLearner: boolean;
  isAdmin: boolean;
  hasRole: (role: string) => boolean;
  // New permission and module functionality
  userPermissions: UserPermission[];
  companyModules: string[];
  hasPermission: (permission: string) => boolean;
  hasModuleAccess: (module: string) => boolean;
  hasFullAccess: (permission: string, module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [companyModules, setCompanyModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [justLoggedOut, setJustLoggedOut] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('🔐 AuthContext: Fetching user roles for:', userId);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          role,
          company_id,
          company_settings (
            company_name,
            modules_enabled
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('🔐 AuthContext: Error fetching user role:', error);
        return;
      }

      console.log('🔐 AuthContext: Raw user roles data:', data);

      if (data && data.length > 0) {
        // Prioritize super_admin role if present, otherwise take first role
        const primaryRole = data.find(role => role.role === 'super_admin') || data[0];
        setUserRole(primaryRole.role);
        setCompanyId(primaryRole.company_id);
        setCompanyName(primaryRole.company_settings?.company_name || null);
        
        // Set company modules
        const modules = primaryRole.company_settings?.modules_enabled || ['training'];
        setCompanyModules(modules);
        
        console.log('🔐 AuthContext: Set primary role:', {
          role: primaryRole.role,
          companyId: primaryRole.company_id,
          companyName: primaryRole.company_settings?.company_name,
          modules
        });

        // Fetch user permissions
        await fetchUserPermissions(userId);
      } else {
        console.log('🔐 AuthContext: No roles found for user');
      }
    } catch (error) {
      console.error('🔐 AuthContext: Error in fetchUserRole:', error);
    }
  };

  const fetchUserPermissions = async (userId: string) => {
    try {
      console.log('🔐 AuthContext: Fetching user permissions for:', userId);
      
      const { data, error } = await supabase.rpc('get_user_permissions', {
        user_id: userId
      });

      if (error) {
        console.error('🔐 AuthContext: Error fetching permissions:', error);
        return;
      }

      console.log('🔐 AuthContext: User permissions:', data);
      setUserPermissions(data || []);
    } catch (error) {
      console.error('🔐 AuthContext: Error in fetchUserPermissions:', error);
      setUserPermissions([]);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
          setCompanyId(null);
          setCompanyName(null);
          setUserPermissions([]);
          setCompanyModules([]);
        }
        
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Set flag to indicate user just logged out
      setJustLoggedOut(true);
      // Clear flag after a short delay
      setTimeout(() => setJustLoggedOut(false), 1000);
      // Successfully signed out, redirect to root
      navigate('/');
    }
  };

  // DEPRECATED: Legacy role checks - use Permission Engine instead
  const isSuperAdmin = userRole === 'super_admin';
  const isCompanyAdmin = userRole === 'company_admin';
  const isClientAdmin = userRole === 'client_admin';
  
  // Debug role detection
  console.log('🔍 AuthContext role detection:', {
    userRole,
    isSuperAdmin,
    isCompanyAdmin,
    isClientAdmin,
    userEmail: user?.email
  });
  
  // Create userRoles array for backward compatibility
  const userRoles = userRole ? [userRole] : [];
  const isLearner = userRole === 'learner';
  const isAdmin = isSuperAdmin || isCompanyAdmin || isClientAdmin;
  
  const hasRole = (role: string) => {
    return userRole === role;
  };

  // DEPRECATED: Legacy permission functions - use Permission Engine instead
  const hasPermission = (permission: string) => {
    console.warn('🚨 DEPRECATED: hasPermission() is deprecated. Use Permission Engine canAccessSync() instead');
    return userPermissions.some(p => p.permission_name === permission);
  };

  const hasModuleAccess = (module: string) => {
    console.warn('🚨 DEPRECATED: hasModuleAccess() from AuthContext is deprecated. Use Permission Engine instead');
    return companyModules.includes(module);
  };

  const hasFullAccess = (permission: string, module: string) => {
    console.warn('🚨 DEPRECATED: hasFullAccess() is deprecated. Use Permission Engine instead');
    return hasPermission(permission) && hasModuleAccess(module);
  };

  const value = {
    user,
    session,
    userRole,
    companyId,
    companyName,
    loading,
    signIn,
    signUp,
    signOut,
    logout: signOut, // Alias for backward compatibility
    justLoggedOut,
    isSuperAdmin,
    isCompanyAdmin,
    isClientAdmin,
    userRoles,
    isLearner,
    isAdmin,
    hasRole,
    userPermissions,
    companyModules,
    hasPermission,
    hasModuleAccess,
    hasFullAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
