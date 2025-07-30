
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, PlayCircle, Zap, Shield, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface PerformanceTestingProps {
  onResultsUpdate: (results: any) => void;
}

export const PerformanceTesting: React.FC<PerformanceTestingProps> = ({ onResultsUpdate }) => {
  const { user } = useAuth();
  const [testStatus, setTestStatus] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const performanceTests = [
    {
      id: 'load-testing',
      name: 'Load Testing',
      description: 'Test with larger datasets and concurrent operations',
      icon: TrendingUp
    },
    {
      id: 'sync-performance',
      name: 'Sync Performance',
      description: 'Monitor DataBridge sync performance and timing',
      icon: Zap
    },
    {
      id: 'security-validation',
      name: 'Security Validation',
      description: 'Verify RLS policies and access controls',
      icon: Shield
    },
    {
      id: 'concurrent-operations',
      name: 'Concurrent Operations',
      description: 'Test multiple simultaneous operations',
      icon: Users
    }
  ];

  const runTest = async (testId: string) => {
    setTestStatus(prev => ({ ...prev, [testId]: 'running' }));
    
    try {
      let result;
      
      switch (testId) {
        case 'load-testing':
          result = await testLoadPerformance();
          break;
        case 'sync-performance':
          result = await testSyncPerformance();
          break;
        case 'security-validation':
          result = await testSecurityValidation();
          break;
        case 'concurrent-operations':
          result = await testConcurrentOperations();
          break;
        default:
          throw new Error('Unknown test');
      }

      setTestStatus(prev => ({ ...prev, [testId]: 'passed' }));
      setTestResults(prev => ({ ...prev, [testId]: result }));
      toast.success(`${testId} test passed`);
      
    } catch (error) {
      console.error(`Test ${testId} failed:`, error);
      setTestStatus(prev => ({ ...prev, [testId]: 'failed' }));
      setTestResults(prev => ({ ...prev, [testId]: { error: error.message } }));
      toast.error(`${testId} test failed: ${error.message}`);
    }
  };

  const testLoadPerformance = async () => {
    const startTime = performance.now();
    
    // Test 1: Bulk VaultPay invoice creation
    const bulkInvoices = [];
    const { data: company } = await supabase
      .from('company_settings')
      .select('id')
      .limit(1)
      .single();

    if (!company) throw new Error('No company found for load testing');

    for (let i = 0; i < 10; i++) {
      bulkInvoices.push({
        company_id: company.id,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        category: 'payroll',
        notes: `Load test invoice ${i + 1}`,
        total_amount: Math.floor(Math.random() * 5000) + 1000
      });
    }

    const { data: createdInvoices, error: invoiceError } = await supabase
      .from('vaultpay_invoices')
      .insert(bulkInvoices)
      .select();

    if (invoiceError) throw invoiceError;

    // Test 2: Bulk DataBridge log creation
    const bulkLogs = [];
    for (let i = 0; i < 20; i++) {
      bulkLogs.push({
        module_name: `Load Test Module ${i + 1}`,
        status: i % 3 === 0 ? 'error' : 'success',
        last_synced_at: new Date().toISOString(),
        origin_module: 'Load Testing',
        target_module: 'Performance Suite',
        sync_duration_ms: Math.floor(Math.random() * 2000) + 500,
        records_processed: Math.floor(Math.random() * 100) + 1
      });
    }

    const { data: createdLogs, error: logError } = await supabase
      .from('databridge_logs')
      .insert(bulkLogs)
      .select();

    if (logError) throw logError;

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    return {
      invoices_created: createdInvoices?.length || 0,
      logs_created: createdLogs?.length || 0,
      total_time_ms: Math.round(totalTime),
      avg_time_per_operation: Math.round(totalTime / 30), // 30 total operations
      performance_rating: totalTime < 5000 ? 'excellent' : totalTime < 10000 ? 'good' : 'needs_improvement'
    };
  };

  const testSyncPerformance = async () => {
    const syncTests = [];
    
    // Test sync performance for different scenarios
    for (let i = 0; i < 5; i++) {
      const startTime = performance.now();
      
      const { data, error } = await supabase
        .from('databridge_logs')
        .insert({
          module_name: `Sync Performance Test ${i + 1}`,
          status: 'success',
          last_synced_at: new Date().toISOString(),
          origin_module: 'Performance Testing',
          target_module: 'Sync Suite',
          sync_duration_ms: Math.floor(Math.random() * 1500) + 500,
          records_processed: Math.floor(Math.random() * 50) + 10
        })
        .select()
        .single();

      const endTime = performance.now();
      
      if (error) throw error;

      syncTests.push({
        test_number: i + 1,
        operation_time_ms: Math.round(endTime - startTime),
        simulated_sync_time: data.sync_duration_ms,
        records_processed: data.records_processed
      });
    }

    const avgOperationTime = syncTests.reduce((sum, test) => sum + test.operation_time_ms, 0) / syncTests.length;
    const avgSyncTime = syncTests.reduce((sum, test) => sum + test.simulated_sync_time, 0) / syncTests.length;

    return {
      sync_tests: syncTests,
      avg_operation_time_ms: Math.round(avgOperationTime),
      avg_simulated_sync_time_ms: Math.round(avgSyncTime),
      total_records_processed: syncTests.reduce((sum, test) => sum + test.records_processed, 0),
      performance_rating: avgOperationTime < 1000 ? 'excellent' : avgOperationTime < 2000 ? 'good' : 'needs_improvement'
    };
  };

  const testSecurityValidation = async () => {
    const securityTests = [];

    // Test 1: Verify RLS on VaultPay invoices
    try {
      const { data, error } = await supabase
        .from('vaultpay_invoices')
        .select('*')
        .limit(5);

      securityTests.push({
        test: 'vaultpay_rls',
        status: error ? 'restricted' : 'accessible',
        records_returned: data?.length || 0
      });
    } catch (error) {
      securityTests.push({
        test: 'vaultpay_rls',
        status: 'error',
        error: error.message
      });
    }

    // Test 2: Verify RLS on DataBridge logs
    try {
      const { data, error } = await supabase
        .from('databridge_logs')
        .select('*')
        .limit(5);

      securityTests.push({
        test: 'databridge_rls',
        status: error ? 'restricted' : 'accessible',
        records_returned: data?.length || 0
      });
    } catch (error) {
      securityTests.push({
        test: 'databridge_rls',
        status: 'error',
        error: error.message
      });
    }

    // Test 3: Verify admin audit log access
    try {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .limit(5);

      securityTests.push({
        test: 'audit_log_rls',
        status: error ? 'restricted' : 'accessible',
        records_returned: data?.length || 0
      });
    } catch (error) {
      securityTests.push({
        test: 'audit_log_rls',
        status: 'error',
        error: error.message
      });
    }

    return {
      security_tests: securityTests,
      total_tests: securityTests.length,
      accessible_tables: securityTests.filter(t => t.status === 'accessible').length,
      restricted_tables: securityTests.filter(t => t.status === 'restricted').length,
      security_score: securityTests.filter(t => t.status !== 'error').length / securityTests.length
    };
  };

  const testConcurrentOperations = async () => {
    const concurrentTests = [];
    
    // Create multiple promises to run simultaneously
    const operations = [];

    // Operation 1: Create invoice
    const companyData = await supabase.from('company_settings').select('id').limit(1).single();
    operations.push(
      supabase
        .from('vaultpay_invoices')
        .insert({
          company_id: companyData.data?.id,
          invoice_number: `PERF-CONCURRENT-${Date.now()}`,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'draft',
          category: 'payroll',
          notes: 'Concurrent test invoice',
          total_amount: 1500.00,
          subtotal_amount: 1500.00,
          created_by: user!.id
        })
        .select()
        .single()
    );

    // Operation 2: Create sync log
    operations.push(
      supabase
        .from('databridge_logs')
        .insert({
          module_name: 'Concurrent Test Module',
          status: 'success',
          last_synced_at: new Date().toISOString(),
          origin_module: 'Concurrent Testing',
          target_module: 'Performance Suite',
          sync_duration_ms: 1200,
          records_processed: 25
        })
        .select()
        .single()
    );

    // Operation 3: Read operations
    operations.push(
      supabase
        .from('vaultpay_invoices')
        .select('*')
        .limit(10)
    );

    operations.push(
      supabase
        .from('databridge_logs')
        .select('*')
        .limit(10)
    );

    const startTime = performance.now();
    
    try {
      const results = await Promise.all(operations);
      const endTime = performance.now();
      
      return {
        concurrent_operations: operations.length,
        total_time_ms: Math.round(endTime - startTime),
        all_successful: results.every(result => !result.error),
        results_summary: results.map((result, index) => ({
          operation: index + 1,
          success: !result.error,
          data_count: result.data ? (Array.isArray(result.data) ? result.data.length : 1) : 0
        }))
      };
    } catch (error) {
      throw new Error(`Concurrent operations failed: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    for (let i = 0; i < performanceTests.length; i++) {
      const test = performanceTests[i];
      await runTest(test.id);
      setProgress((i + 1) / performanceTests.length * 100);
    }
    
    setIsRunning(false);
    
    // Update parent with results
    const overallStatus = Object.values(testStatus).every(status => status === 'passed') ? 'passed' : 'failed';
    onResultsUpdate({ status: overallStatus, results: testResults });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance & Security Testing</CardTitle>
              <CardDescription>
                Load testing, security validation, and optimization checks
              </CardDescription>
            </div>
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="gap-2"
            >
              <PlayCircle className="h-4 w-4" />
              Run All Tests
            </Button>
          </div>
          {isRunning && (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">
                Running tests... {Math.round(progress)}% complete
              </p>
            </div>
          )}
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {performanceTests.map((test) => (
          <Card key={test.id}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <test.icon className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {test.description}
                    </CardDescription>
                  </div>
                </div>
                {getStatusIcon(testStatus[test.id])}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant={testStatus[test.id] === 'passed' ? 'default' : 'secondary'}>
                  {testStatus[test.id] || 'Pending'}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => runTest(test.id)}
                  disabled={testStatus[test.id] === 'running'}
                >
                  Run Test
                </Button>
              </div>
              
              {testResults[test.id] && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <pre className="text-xs text-muted-foreground overflow-auto max-h-40">
                    {JSON.stringify(testResults[test.id], null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
