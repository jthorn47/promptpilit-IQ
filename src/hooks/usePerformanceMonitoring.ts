import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ModuleHealth {
  moduleId: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastError?: string;
  performance: {
    responseTime: number;
    errorRate: number;
    usage: number;
  };
  issues: HealthIssue[];
}

interface HealthIssue {
  type: 'performance' | 'configuration' | 'integration' | 'usage';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  autoFixAvailable: boolean;
}

interface PerformanceMetrics {
  totalUsers: number;
  activeModules: number;
  systemLoad: number;
  avgResponseTime: number;
  errorRate: number;
  moduleHealth: ModuleHealth[];
}

export const usePerformanceMonitoring = (companyId: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalUsers: 0,
    activeModules: 0,
    systemLoad: 0,
    avgResponseTime: 0,
    errorRate: 0,
    moduleHealth: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      fetchPerformanceMetrics();
      // Set up real-time monitoring
      const interval = setInterval(fetchPerformanceMetrics, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [companyId]);

  const fetchPerformanceMetrics = async () => {
    try {
      setLoading(true);
      
      // Fetch enabled modules
      const { data: companyData } = await supabase
        .from('company_settings')
        .select('modules_enabled, module_setup_status')
        .eq('id', companyId)
        .single();

      if (companyData) {
        const enabledModules = companyData.modules_enabled || [];
        const moduleHealthData = generateModuleHealth(enabledModules);
        
        const mockMetrics: PerformanceMetrics = {
          totalUsers: Math.floor(Math.random() * 100) + 20,
          activeModules: enabledModules.length,
          systemLoad: Math.random() * 100,
          avgResponseTime: Math.random() * 500 + 100,
          errorRate: Math.random() * 5,
          moduleHealth: moduleHealthData
        };
        
        setMetrics(mockMetrics);
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateModuleHealth = (enabledModules: string[]): ModuleHealth[] => {
    return enabledModules.map(moduleId => {
      const uptime = 95 + Math.random() * 5; // 95-100% uptime
      const responseTime = Math.random() * 300 + 50; // 50-350ms
      const errorRate = Math.random() * 3; // 0-3% error rate
      const usage = Math.random() * 100; // 0-100% usage
      
      const issues: HealthIssue[] = [];
      
      // Generate realistic issues based on performance
      if (responseTime > 250) {
        issues.push({
          type: 'performance',
          severity: 'medium',
          message: 'Module response time is above recommended threshold',
          suggestion: 'Consider optimizing database queries or increasing server resources',
          autoFixAvailable: false
        });
      }
      
      if (errorRate > 2) {
        issues.push({
          type: 'configuration',
          severity: 'high',
          message: 'High error rate detected in module operations',
          suggestion: 'Check module configuration and integration settings',
          autoFixAvailable: true
        });
      }
      
      if (usage < 10 && moduleId !== 'assessments') {
        issues.push({
          type: 'usage',
          severity: 'low',
          message: 'Low module adoption among users',
          suggestion: 'Consider providing additional training or improving user onboarding',
          autoFixAvailable: false
        });
      }

      const status: 'healthy' | 'warning' | 'critical' = 
        issues.some(i => i.severity === 'high') ? 'critical' :
        issues.some(i => i.severity === 'medium') ? 'warning' : 'healthy';

      return {
        moduleId,
        status,
        uptime,
        performance: {
          responseTime,
          errorRate,
          usage
        },
        issues
      };
    });
  };

  const getSystemHealthScore = (): number => {
    if (metrics.moduleHealth.length === 0) return 100;
    
    const healthyModules = metrics.moduleHealth.filter(m => m.status === 'healthy').length;
    const totalModules = metrics.moduleHealth.length;
    
    return Math.round((healthyModules / totalModules) * 100);
  };

  const getCriticalIssues = (): HealthIssue[] => {
    return metrics.moduleHealth
      .flatMap(m => m.issues)
      .filter(issue => issue.severity === 'high');
  };

  const autoFixIssues = async (): Promise<boolean> => {
    try {
      // Simulate auto-fixing issues
      const fixableIssues = getCriticalIssues().filter(issue => issue.autoFixAvailable);
      
      if (fixableIssues.length > 0) {
        // In real implementation, this would trigger actual fixes
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Refresh metrics after fixes
        await fetchPerformanceMetrics();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error auto-fixing issues:', error);
      return false;
    }
  };

  return {
    metrics,
    loading,
    systemHealthScore: getSystemHealthScore(),
    criticalIssues: getCriticalIssues(),
    autoFixIssues,
    refresh: fetchPerformanceMetrics
  };
};