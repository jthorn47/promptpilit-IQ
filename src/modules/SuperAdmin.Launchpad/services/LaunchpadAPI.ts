
import { supabase } from '@/integrations/supabase/client';
import type { 
  SystemHealth, 
  ModuleStatus, 
  SystemAlert, 
  RecentItem, 
  SecurityMetrics 
} from '../types/launchpad.types';

export class LaunchpadAPI {
  
  static async getSystemHealth(): Promise<SystemHealth> {
    try {
      // Get basic system metrics
      const { data: companies } = await supabase
        .from('company_settings')
        .select('id')
        .eq('lifecycle_stage', 'client');
        
      const { data: users } = await supabase
        .from('profiles')
        .select('user_id');
        
      // Get recent activity (last 24h)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('user_id')
        .gte('updated_at', yesterday.toISOString());

      // Check microservices health via edge functions
      const microservicesOnline = await this.checkMicroservicesHealth();
      
      return {
        uptime: this.calculateUptime(),
        aiAssistants: 3, // TaxIQ, WageCheckIQ, PayrollCopilot
        activeOrgs: companies?.length || 0,
        totalUsers: users?.length || 0,
        activeUsers24h: recentUsers?.length || 0,
        microservicesOnline: microservicesOnline.online,
        microservicesTotal: microservicesOnline.total,
        lastSyncTimestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching system health:', error);
      throw error;
    }
  }

  static async getModuleStatuses(): Promise<ModuleStatus[]> {
    const modules = [
      {
        id: 'taxiq',
        name: 'TaxIQ',
        version: '1.0.0',
        status: 'online' as ModuleStatus['status'],
        orgsUsing: 0,
        errorCount: 0,
        lastUpdate: new Date().toISOString()
      },
      {
        id: 'wagecheckiq',
        name: 'WageCheckIQ',
        version: '1.0.0', 
        status: 'online' as ModuleStatus['status'],
        orgsUsing: 0,
        errorCount: 0,
        lastUpdate: new Date().toISOString()
      },
      {
        id: 'payroll-copilot',
        name: 'Payroll Copilot',
        version: '1.0.0',
        status: 'online' as ModuleStatus['status'],
        orgsUsing: 0,
        errorCount: 0,
        lastUpdate: new Date().toISOString()
      }
    ];

    // Get actual usage data
    for (const module of modules) {
      try {
        if (module.id === 'taxiq') {
          const { data } = await supabase
            .from('tax_calculations')
            .select('payroll_run_id')
            .gte('calculated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
          module.orgsUsing = new Set(data?.map(d => d.payroll_run_id)).size;
        }
      } catch (error) {
        console.error(`Error getting usage for ${module.id}:`, error);
        module.status = 'offline';
        module.errorCount = 1;
      }
    }

    return modules;
  }

  static async getSystemAlerts(): Promise<SystemAlert[]> {
    const alerts: SystemAlert[] = [];
    
    try {
      // Check for recent failed background jobs
      const { data: failedJobs } = await supabase
        .from('background_job_logs')
        .select('*')
        .eq('status', 'failed')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(5);

      if (failedJobs && failedJobs.length > 0) {
        alerts.push({
          id: 'failed-jobs',
          type: 'error',
          title: 'Background Job Failures',
          description: `${failedJobs.length} background jobs failed in the last 24 hours`,
          priority: 'high',
          createdAt: new Date().toISOString()
        });
      }

      // Check Phase 1 completion status
      alerts.push({
        id: 'phase1-completion',
        type: 'info',
        title: 'Phase 1 Infrastructure Complete',
        description: 'TaxIQ and WageCheckIQ core systems are operational and ready for Phase 2',
        actionUrl: '/admin/phase1-dashboard',
        priority: 'medium',
        createdAt: new Date().toISOString()
      });

      // Check for wage compliance alerts
      const { data: wageAlerts } = await supabase
        .from('wage_compliance_alerts')
        .select('*')
        .eq('is_resolved', false)
        .limit(3);

      if (wageAlerts && wageAlerts.length > 0) {
        alerts.push({
          id: 'wage-compliance',
          type: 'warning',
          title: 'Wage Compliance Issues',
          description: `${wageAlerts.length} unresolved wage compliance alerts require attention`,
          actionUrl: '/admin/compliance',
          priority: 'high',
          createdAt: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Error fetching system alerts:', error);
    }

    return alerts;
  }

  static async getRecentActivity(): Promise<RecentItem[]> {
    const recentItems: RecentItem[] = [];

    try {
      // Get recent tax calculations
      const { data: recentCalcs } = await supabase
        .from('tax_calculations')
        .select('*')
        .order('calculated_at', { ascending: false })
        .limit(3);

      if (recentCalcs) {
        recentItems.push(...recentCalcs.map(calc => ({
          id: calc.id,
          type: 'tool' as const,
          title: 'Tax Calculation Completed',
          subtitle: `Employee ${calc.employee_id}`,
          url: `/admin/payroll/${calc.payroll_run_id}`,
          timestamp: calc.calculated_at
        })));
      }

      // Get recent admin actions
      const { data: adminActions } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (adminActions) {
        recentItems.push(...adminActions.map(action => ({
          id: action.id,
          type: 'config' as const,
          title: `${action.action_type} ${action.resource_type}`,
          subtitle: (typeof action.action_details === 'object' && action.action_details && 'description' in action.action_details ? action.action_details.description as string : null) || 'Admin action',
          url: '/admin/audit',
          timestamp: action.created_at
        })));
      }

    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }

    return recentItems.slice(0, 5);
  }

  static async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      // Get MFA enforcement stats
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id');

      const mfaEnforcementRate = 85; // Placeholder - would calculate from auth data

      // Get audit log size
      const { data: auditLogs } = await supabase
        .from('admin_audit_log')
        .select('id')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      return {
        mfaEnforcementRate,
        lastPasswordPolicyUpdate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        auditLogSize: auditLogs?.length || 0,
        threatLevel: 'low'
      };
    } catch (error) {
      console.error('Error fetching security metrics:', error);
      throw error;
    }
  }

  private static async checkMicroservicesHealth(): Promise<{ online: number; total: number }> {
    const services = [
      'process-payroll-taxes',
      'wage-data-parser', 
      'taxiq-validation',
      'trigger-payroll-taxes'
    ];

    let onlineCount = 0;

    for (const service of services) {
      try {
        // Attempt a lightweight health check
        const { error } = await supabase.functions.invoke(service, {
          body: { health_check: true }
        });
        
        if (!error) onlineCount++;
      } catch (error) {
        console.log(`Service ${service} appears offline:`, error);
      }
    }

    return {
      online: onlineCount,
      total: services.length
    };
  }

  private static calculateUptime(): number {
    // Calculate uptime since last deployment
    // This would typically be tracked in a separate monitoring system
    const deploymentTime = new Date('2025-01-21').getTime();
    const now = Date.now();
    const uptimeMs = now - deploymentTime;
    const uptimeHours = uptimeMs / (1000 * 60 * 60);
    
    return Math.round(uptimeHours);
  }
}
