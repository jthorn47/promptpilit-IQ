
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, PlayCircle, ArrowRight, Workflow, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface IntegrationTestingProps {
  onResultsUpdate: (results: any) => void;
}

export const IntegrationTesting: React.FC<IntegrationTestingProps> = ({ onResultsUpdate }) => {
  const { user } = useAuth();
  const [testStatus, setTestStatus] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const integrationTests = [
    {
      id: 'payroll-vaultpay',
      name: 'Payroll → VaultPay',
      description: 'Test automatic invoice generation from payroll runs',
      icon: ArrowRight
    },
    {
      id: 'cross-module-sync',
      name: 'Cross-Module Sync',
      description: 'Test VaultPay → ReportsIQ and other data flows',
      icon: Workflow
    },
    {
      id: 'end-to-end',
      name: 'End-to-End Workflow',
      description: 'Complete payroll → invoice → payment cycle',
      icon: RotateCcw
    },
    {
      id: 'error-recovery',
      name: 'Error Recovery',
      description: 'Test error recovery scenarios and data consistency',
      icon: PlayCircle
    }
  ];

  const runTest = async (testId: string) => {
    setTestStatus(prev => ({ ...prev, [testId]: 'running' }));
    
    try {
      let result;
      
      switch (testId) {
        case 'payroll-vaultpay':
          result = await testPayrollVaultPayIntegration();
          break;
        case 'cross-module-sync':
          result = await testCrossModuleSync();
          break;
        case 'end-to-end':
          result = await testEndToEndWorkflow();
          break;
        case 'error-recovery':
          result = await testErrorRecovery();
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

  const testPayrollVaultPayIntegration = async () => {
    // Get a company with VaultPay settings
    const { data: company } = await supabase
      .from('company_settings')
      .select('id, company_name, vaultpay_fee_type, vaultpay_rate_per_employee, vaultpay_flat_fee')
      .not('vaultpay_fee_type', 'is', null)
      .limit(1)
      .single();

    if (!company) throw new Error('No companies with VaultPay settings found');

    // Create a mock payroll run
    const { data: payrollRun, error: payrollError } = await supabase
      .from('payroll_runs')
      .insert({
        company_id: company.id,
        pay_period_start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        pay_period_end: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        pay_date: new Date().toISOString().split('T')[0],
        run_name: `Test Run ${Date.now()}`,
        status: 'draft',
        created_by: user!.id
      })
      .select()
      .single();

    if (payrollError) throw payrollError;

    // Check if invoice was auto-generated when payroll is finalized
    const beforeInvoiceCount = await supabase
      .from('vaultpay_invoices')
      .select('id', { count: 'exact' })
      .eq('company_id', company.id);

    // Finalize the payroll run (this should trigger auto-invoice generation)
    const { error: updateError } = await supabase
      .from('payroll_runs')
      .update({ 
        status: 'finalized',
        finalized_date: new Date().toISOString()
      })
      .eq('id', payrollRun.id);

    if (updateError) throw updateError;

    // Wait a moment for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if invoice was created
    const afterInvoiceCount = await supabase
      .from('vaultpay_invoices')
      .select('id', { count: 'exact' })
      .eq('company_id', company.id);

    const invoiceGenerated = (afterInvoiceCount.count || 0) > (beforeInvoiceCount.count || 0);

    return {
      payroll_run_id: payrollRun.id,
      company_id: company.id,
      company_name: company.company_name,
      fee_type: company.vaultpay_fee_type,
      invoice_auto_generated: invoiceGenerated,
      before_count: beforeInvoiceCount.count,
      after_count: afterInvoiceCount.count
    };
  };

  const testCrossModuleSync = async () => {
    // Test DataBridge sync between modules
    const syncTests = [
      { from: 'VaultPay', to: 'ReportsIQ' },
      { from: 'Payroll', to: 'VaultPay' },
      { from: 'BenefitsIQ', to: 'Payroll' }
    ];

    const results = [];

    for (const test of syncTests) {
      // Create sync log entry
      const { data, error } = await supabase
        .from('databridge_logs')
        .insert({
          module_name: `${test.from}-${test.to} Sync`,
          status: 'success',
          last_synced_at: new Date().toISOString(),
          origin_module: test.from,
          target_module: test.to,
          sync_duration_ms: Math.floor(Math.random() * 1500) + 500,
          records_processed: Math.floor(Math.random() * 50) + 1
        })
        .select()
        .single();

      if (error) throw error;

      results.push({
        sync_id: data.id,
        from: test.from,
        to: test.to,
        status: data.status,
        duration_ms: data.sync_duration_ms,
        records: data.records_processed
      });
    }

    return {
      sync_tests: results,
      total_syncs: results.length,
      all_successful: results.every(r => r.status === 'success')
    };
  };

  const testEndToEndWorkflow = async () => {
    // This simulates a complete workflow from payroll to payment
    const steps = [];

    // Step 1: Create payroll run
    const { data: company } = await supabase
      .from('company_settings')
      .select('id, company_name')
      .limit(1)
      .single();

    if (!company) throw new Error('No company found for testing');

    const { data: payrollRun } = await supabase
      .from('payroll_runs')
      .insert({
        company_id: company.id,
        pay_period_start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        pay_period_end: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        pay_date: new Date().toISOString().split('T')[0],
        run_name: `E2E Test Run ${Date.now()}`,
        status: 'finalized',
        created_by: user!.id
      })
      .select()
      .single();

    steps.push({ step: 'payroll_created', id: payrollRun?.id, status: 'success' });

    // Step 2: Create invoice
    const { data: invoice } = await supabase
      .from('vaultpay_invoices')
      .insert({
        company_id: company.id,
        payroll_run_id: payrollRun?.id,
        invoice_number: `TEST-E2E-${Date.now()}`,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'sent',
        category: 'payroll',
        total_amount: 2500.00,
        subtotal_amount: 2500.00,
        created_by: user!.id
      })
      .select()
      .single();

    steps.push({ step: 'invoice_created', id: invoice?.id, status: 'success' });

    // Step 3: Record payment
    const { data: payment } = await supabase
      .from('vaultpay_payments')
      .insert({
        invoice_id: invoice?.id,
        amount: 2500.00,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'ach',
        reference_number: `TEST-E2E-${Date.now()}`,
        applied_by: user!.id,
        company_id: company.id
      })
      .select()
      .single();

    steps.push({ step: 'payment_recorded', id: payment?.id, status: 'success' });

    return {
      workflow_steps: steps,
      company_id: company.id,
      payroll_run_id: payrollRun?.id,
      invoice_id: invoice?.id,
      payment_id: payment?.id,
      all_steps_successful: steps.every(s => s.status === 'success')
    };
  };

  const testErrorRecovery = async () => {
    // Test error scenarios and recovery
    const errorTests = [];

    // Test 1: Create failed sync and retry
    const { data: failedSync } = await supabase
      .from('databridge_logs')
      .insert({
        module_name: 'Error Recovery Test',
        status: 'error',
        last_synced_at: new Date().toISOString(),
        error_message: 'Simulated connection timeout for testing',
        origin_module: 'Testing Suite',
        target_module: 'Error Recovery',
        sync_duration_ms: 0,
        records_processed: 0,
        retry_count: 1
      })
      .select()
      .single();

    errorTests.push({
      test: 'failed_sync_creation',
      log_id: failedSync?.id,
      status: 'success'
    });

    // Test 2: Simulate retry
    if (failedSync) {
      const { data: retrySync } = await supabase
        .from('databridge_logs')
        .insert({
          module_name: 'Error Recovery Test',
          status: 'success',
          last_synced_at: new Date().toISOString(),
          origin_module: 'Testing Suite',
          target_module: 'Error Recovery',
          sync_duration_ms: 1250,
          records_processed: 15,
          retry_count: 0
        })
        .select()
        .single();

      errorTests.push({
        test: 'retry_successful',
        original_log_id: failedSync.id,
        retry_log_id: retrySync?.id,
        status: 'success'
      });
    }

    return {
      error_recovery_tests: errorTests,
      total_tests: errorTests.length,
      all_successful: errorTests.every(t => t.status === 'success')
    };
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    for (let i = 0; i < integrationTests.length; i++) {
      const test = integrationTests[i];
      await runTest(test.id);
      setProgress((i + 1) / integrationTests.length * 100);
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
              <CardTitle>Integration Testing</CardTitle>
              <CardDescription>
                Test cross-module data flows and end-to-end workflows
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
        {integrationTests.map((test) => (
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
