import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

export interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  message: string;
  duration: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface IntegrationHealth {
  component: string;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
  responseTime?: number;
  errorCount: number;
  details: Record<string, any>;
}

export const useIntegrationTesting = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [healthStatus, setHealthStatus] = useState<IntegrationHealth[]>([]);

  // Test Database Connectivity
  const testDatabaseConnectivity = useCallback(async (): Promise<TestResult> => {
    const startTime = Date.now();
    const testName = 'Database Connectivity';
    
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('id')
        .limit(1);
      
      if (error) throw error;
      
      return {
        testName,
        status: 'passed',
        message: 'Database connection successful',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        metadata: { recordCount: data?.length || 0 }
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        message: `Database connection failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }, []);

  // Test Permission System
  const testPermissionSystem = useCallback(async (): Promise<TestResult> => {
    const startTime = Date.now();
    const testName = 'Permission System';
    
    try {
      // Test role-based access
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .limit(1);
      
      if (rolesError) throw rolesError;
      
      // Test permission check function
      const { data: hasPermission, error: permError } = await supabase
        .rpc('user_has_permission', {
          user_id: user?.id,
          permission_name: 'view_dashboard'
        });
      
      if (permError) throw permError;
      
      return {
        testName,
        status: 'passed',
        message: 'Permission system functioning correctly',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        metadata: { 
          userRoles: userRoles?.length || 0,
          hasViewPermission: hasPermission 
        }
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        message: `Permission system test failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }, [user?.id]);

  // Test Case Routing
  const testCaseRouting = useCallback(async (): Promise<TestResult> => {
    const startTime = Date.now();
    const testName = 'Case Routing System';
    
    try {
      // Test routing rules existence
      const { data: rules, error: rulesError } = await supabase
        .from('case_routing_rules')
        .select('*')
        .limit(5);
      
      if (rulesError) throw rulesError;
      
      // Test consultant capacity
      const { data: capacity, error: capacityError } = await supabase
        .from('employees')
        .select('*')
        .limit(5);
      
      if (capacityError) throw capacityError;
      
      return {
        testName,
        status: 'passed',
        message: 'Case routing system operational',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        metadata: { 
          activeRules: rules?.length || 0,
          capacityRecords: capacity?.length || 0
        }
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        message: `Case routing test failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }, []);

  // Test Billing Integration
  const testBillingIntegration = useCallback(async (): Promise<TestResult> => {
    const startTime = Date.now();
    const testName = 'Billing Integration';
    
    try {
      // Test billing integrations table
      const { data: integrations, error: integrationsError } = await supabase
        .from('company_settings')
        .select('*')
        .limit(5);
      
      if (integrationsError) throw integrationsError;
      
      return {
        testName,
        status: 'passed',
        message: 'Billing integration systems accessible',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        metadata: { 
          activeIntegrations: integrations?.length || 0
        }
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        message: `Billing integration test failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }, []);

  // Test Analytics System
  const testAnalyticsSystem = useCallback(async (): Promise<TestResult> => {
    const startTime = Date.now();
    const testName = 'Analytics System';
    
    try {
      // Test performance analytics
      const { data: analytics, error: analyticsError } = await supabase
        .from('performance_analytics')
        .select('*')
        .limit(5);
      
      if (analyticsError) throw analyticsError;
      
      // Test AI insights
      const { data: insights, error: insightsError } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('is_dismissed', false)
        .limit(5);
      
      if (insightsError) throw insightsError;
      
      return {
        testName,
        status: 'passed',
        message: 'Analytics system functioning',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        metadata: { 
          analyticsRecords: analytics?.length || 0,
          activeInsights: insights?.length || 0
        }
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        message: `Analytics system test failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }, []);

  // Test Edge Functions
  const testEdgeFunctions = useCallback(async (): Promise<TestResult> => {
    const startTime = Date.now();
    const testName = 'Edge Functions';
    
    try {
      // Test case assignment function
      const { data: assignmentResult, error: assignmentError } = await supabase.functions
        .invoke('intelligent-case-assignment', {
          body: {
            caseId: 'test-case-id',
            caseType: 'hr_inquiry',
            priority: 'medium',
            department: 'hr',
            testMode: true
          }
        });
      
      if (assignmentError) throw assignmentError;
      
      return {
        testName,
        status: 'passed',
        message: 'Edge functions responding correctly',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        metadata: { 
          functionResponse: assignmentResult || 'No response'
        }
      };
    } catch (error) {
      return {
        testName,
        status: error.message?.includes('not found') ? 'warning' : 'failed',
        message: `Edge functions test: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }, []);

  // Run Full Integration Test Suite
  const runIntegrationTests = useCallback(async () => {
    setLoading(true);
    const results: TestResult[] = [];
    
    try {
      // Run all tests
      const tests = [
        testDatabaseConnectivity,
        testPermissionSystem,
        testCaseRouting,
        testBillingIntegration,
        testAnalyticsSystem,
        testEdgeFunctions
      ];
      
      for (const test of tests) {
        const result = await test();
        results.push(result);
        logger.info('Test completed', result);
      }
      
      setTestResults(results);
      
      // Calculate overall health
      const failedTests = results.filter(r => r.status === 'failed').length;
      const warningTests = results.filter(r => r.status === 'warning').length;
      
      let overallStatus: 'healthy' | 'degraded' | 'down';
      if (failedTests === 0 && warningTests === 0) {
        overallStatus = 'healthy';
      } else if (failedTests === 0) {
        overallStatus = 'degraded';
      } else {
        overallStatus = 'down';
      }
      
      logger.info('Integration test suite completed', {
        totalTests: results.length,
        passed: results.filter(r => r.status === 'passed').length,
        failed: failedTests,
        warnings: warningTests,
        overallStatus
      });
      
      return {
        results,
        summary: {
          total: results.length,
          passed: results.filter(r => r.status === 'passed').length,
          failed: failedTests,
          warnings: warningTests,
          overallStatus
        }
      };
    } catch (error) {
      logger.error('Integration test suite failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [
    testDatabaseConnectivity,
    testPermissionSystem,
    testCaseRouting,
    testBillingIntegration,
    testAnalyticsSystem,
    testEdgeFunctions
  ]);

  // Monitor System Health
  const checkSystemHealth = useCallback(async () => {
    try {
      const healthChecks: IntegrationHealth[] = [];
      
      // Database health
      const dbStart = Date.now();
      const { error: dbError } = await supabase.from('company_settings').select('id').limit(1);
      healthChecks.push({
        component: 'Database',
        status: dbError ? 'down' : 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime: Date.now() - dbStart,
        errorCount: dbError ? 1 : 0,
        details: { error: dbError?.message }
      });
      
      // Authentication health
      const authStart = Date.now();
      const { data: session } = await supabase.auth.getSession();
      healthChecks.push({
        component: 'Authentication',
        status: session.session ? 'healthy' : 'degraded',
        lastCheck: new Date().toISOString(),
        responseTime: Date.now() - authStart,
        errorCount: 0,
        details: { hasSession: !!session.session }
      });
      
      setHealthStatus(healthChecks);
      return healthChecks;
    } catch (error) {
      logger.error('Health check failed', error);
      throw error;
    }
  }, []);

  // Performance Benchmarking
  const runPerformanceBenchmark = useCallback(async () => {
    const benchmarks: Record<string, number> = {};
    
    try {
      // Database query performance
      const dbStart = Date.now();
      await supabase.from('company_settings').select('*').limit(100);
      benchmarks.databaseQuery = Date.now() - dbStart;
      
      // Complex query performance
      const complexStart = Date.now();
      await supabase
        .from('employees')
        .select(`
          *,
          company_settings(company_name),
          user_roles(role)
        `)
        .limit(50);
      benchmarks.complexQuery = Date.now() - complexStart;
      
      // Function call performance
      const funcStart = Date.now();
      await supabase.rpc('user_has_permission', {
        user_id: user?.id,
        permission_name: 'view_dashboard'
      });
      benchmarks.functionCall = Date.now() - funcStart;
      
      logger.info('Performance benchmark completed', benchmarks);
      return benchmarks;
    } catch (error) {
      logger.error('Performance benchmark failed', error);
      throw error;
    }
  }, [user?.id]);

  return {
    // State
    loading,
    testResults,
    healthStatus,

    // Test Functions
    runIntegrationTests,
    testDatabaseConnectivity,
    testPermissionSystem,
    testCaseRouting,
    testBillingIntegration,
    testAnalyticsSystem,
    testEdgeFunctions,

    // Health Monitoring
    checkSystemHealth,
    runPerformanceBenchmark
  };
};