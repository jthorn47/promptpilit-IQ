import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityContextType {
  securityAlerts: SecurityAlert[];
  isSecureSession: boolean;
  performSecurityAudit: () => Promise<void>;
  encryptSensitiveField: (field: string, value: string) => Promise<string>;
  logSecurityEvent: (event: SecurityEvent) => Promise<void>;
  checkDataAccess: (resource: string, operation: string) => Promise<boolean>;
}

interface SecurityAlert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface SecurityEvent {
  event_type: string;
  resource_type: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  metadata?: any;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [isSecureSession, setIsSecureSession] = useState(false);
  const [lastSecurityCheck, setLastSecurityCheck] = useState<number>(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      initializeSecurity();
      startSecurityMonitoring();
    }
  }, [user]);

  const initializeSecurity = async () => {
    try {
      // Check session security
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        setIsSecureSession(true);
        
        // Log session start
        await logSecurityEvent({
          event_type: 'session_start',
          resource_type: 'authentication',
          description: 'User session initiated',
          risk_level: 'low'
        });
      }

      // Load existing security alerts
      await loadSecurityAlerts();
    } catch (error) {
      console.error('Security initialization failed:', error);
    }
  };

  const startSecurityMonitoring = () => {
    // Monitor for suspicious activity patterns
    const interval = setInterval(async () => {
      await performAutomaticSecurityCheck();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  };

  const performAutomaticSecurityCheck = async () => {
    try {
      // Check for unusual login patterns
      const { data: recentLogins } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (recentLogins && recentLogins.length > 10) {
        await createSecurityAlert({
          type: 'medium',
          message: 'Unusual login frequency detected',
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }

      // Check for data access violations
      const { data: violations } = await supabase
        .from('compliance_violations')
        .select('*')
        .eq('user_id', user?.id)
        .eq('investigation_status', 'open');

      if (violations && violations.length > 0) {
        await createSecurityAlert({
          type: 'high',
          message: `${violations.length} compliance violations require attention`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }
    } catch (error) {
      console.error('Automatic security check failed:', error);
    }
  };

  const loadSecurityAlerts = async () => {
    try {
      // Add caching and throttling to reduce frequent requests
      const now = Date.now();
      if (lastSecurityCheck && now - lastSecurityCheck < 30000) {
        return; // Skip if checked within last 30 seconds
      }
      setLastSecurityCheck(now);
      
      const { data } = await supabase
        .from('security_audit_logs')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        const alerts = data.map(log => ({
          id: log.id,
          type: (log.metadata as any)?.risk_level || 'medium' as 'critical' | 'high' | 'medium' | 'low',
          message: log.action || 'Security event logged',
          timestamp: log.created_at,
          resolved: log.event_type === 'resolved'
        }));
        setSecurityAlerts(alerts);
      }
    } catch (error) {
      console.error('Failed to load security alerts:', error);
    }
  };

  const createSecurityAlert = async (alert: Omit<SecurityAlert, 'id'>) => {
    const newAlert = { ...alert, id: crypto.randomUUID() };
    setSecurityAlerts(prev => [newAlert, ...prev]);

    // Log to database
    await logSecurityEvent({
      event_type: 'security_alert',
      resource_type: 'monitoring',
      description: alert.message,
      risk_level: alert.type,
      metadata: { alert_id: newAlert.id }
    });
  };

  const performSecurityAudit = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('security-audit', {
        body: { 
          user_id: user?.id,
          audit_type: 'comprehensive',
          include_compliance: true
        }
      });

      if (error) throw error;

      if (data?.alerts) {
        setSecurityAlerts(prev => [...data.alerts, ...prev]);
      }

      await logSecurityEvent({
        event_type: 'security_audit',
        resource_type: 'system',
        description: 'Manual security audit performed',
        risk_level: 'low'
      });
    } catch (error) {
      console.error('Security audit failed:', error);
      throw error;
    }
  };

  const encryptSensitiveField = async (field: string, value: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('field-encryption', {
        body: { 
          action: 'encrypt',
          field_name: field,
          field_value: value,
          user_id: user?.id
        }
      });

      if (error) throw error;

      await logSecurityEvent({
        event_type: 'data_encryption',
        resource_type: 'data_protection',
        description: `Field ${field} encrypted`,
        risk_level: 'low'
      });

      return data.encrypted_value;
    } catch (error) {
      console.error('Field encryption failed:', error);
      throw error;
    }
  };

  const logSecurityEvent = async (event: SecurityEvent) => {
    try {
      await supabase
        .from('security_audit_logs')
        .insert({
          user_id: user?.id || '',
          event_type: event.event_type,
          action: event.description,
          resource_type: event.resource_type,
          success: true,
          metadata: {
            ...event.metadata,
            risk_level: event.risk_level,
            ip_address: await getClientIP(),
            user_agent: navigator.userAgent
          }
        });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const checkDataAccess = async (resource: string, operation: string): Promise<boolean> => {
    try {
      const { data } = await supabase
        .from('data_access_permissions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('resource_type', resource)
        .eq('permission_type', operation)
        .eq('is_active', true)
        .single();

      const hasAccess = !!data;

      await logSecurityEvent({
        event_type: 'access_check',
        resource_type: resource,
        description: `Access ${hasAccess ? 'granted' : 'denied'} for ${operation}`,
        risk_level: hasAccess ? 'low' : 'medium',
        metadata: { operation, access_granted: hasAccess }
      });

      return hasAccess;
    } catch (error) {
      console.error('Data access check failed:', error);
      return false;
    }
  };

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  return (
    <SecurityContext.Provider value={{
      securityAlerts,
      isSecureSession,
      performSecurityAudit,
      encryptSensitiveField,
      logSecurityEvent,
      checkDataAccess
    }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};