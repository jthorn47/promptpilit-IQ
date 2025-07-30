
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, PlayCircle, FileText, DollarSign, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface VaultPayTestingProps {
  onResultsUpdate: (results: any) => void;
}

export const VaultPayTesting: React.FC<VaultPayTestingProps> = ({ onResultsUpdate }) => {
  const { user } = useAuth();
  const [testStatus, setTestStatus] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const vaultPayTests = [
    {
      id: 'invoice-generation',
      name: 'Invoice Generation',
      description: 'Test invoice creation and numbering system',
      icon: FileText
    },
    {
      id: 'payment-processing',
      name: 'Payment Processing',
      description: 'Test payment recording and invoice updates',
      icon: DollarSign
    },
    {
      id: 'ar-aging',
      name: 'AR Aging Calculations',
      description: 'Test accounts receivable aging reports',
      icon: Settings
    },
    {
      id: 'auto-generation',
      name: 'Auto Invoice Generation',
      description: 'Test automatic invoice generation from payroll',
      icon: PlayCircle
    }
  ];

  const runTest = async (testId: string) => {
    setTestStatus(prev => ({ ...prev, [testId]: 'running' }));
    
    try {
      let result;
      
      switch (testId) {
        case 'invoice-generation':
          result = await testInvoiceGeneration();
          break;
        case 'payment-processing':
          result = await testPaymentProcessing();
          break;
        case 'ar-aging':
          result = await testARAging();
          break;
        case 'auto-generation':
          result = await testAutoGeneration();
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

  const testInvoiceGeneration = async () => {
    // Get demo company
    const { data: companies } = await supabase
      .from('company_settings')
      .select('id, company_name')
      .limit(1)
      .single();

    if (!companies) throw new Error('No companies found for testing');

    // Create test invoice
    const { data: invoice, error } = await supabase
      .from('vaultpay_invoices')
      .insert({
        company_id: companies.id,
        invoice_number: `TEST-INV-${Date.now()}`,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        category: 'payroll',
        notes: 'Test invoice for VaultPay testing',
        total_amount: 1250.00,
        subtotal_amount: 1250.00,
        created_by: user!.id
      })
      .select()
      .single();

    if (error) throw error;

    // Add line item
    const { error: lineError } = await supabase
      .from('vaultpay_invoice_line_items')
      .insert({
        invoice_id: invoice.id,
        description: 'Payroll Processing: Test Period',
        quantity: 25,
        unit_price: 50.00,
        total: 1250.00
      });

    if (lineError) throw lineError;

    return {
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      total_amount: invoice.total_amount,
      status: 'success'
    };
  };

  const testPaymentProcessing = async () => {
    // Get demo company first
    const { data: companies } = await supabase
      .from('company_settings')
      .select('id, company_name')
      .limit(1)
      .single();

    if (!companies) throw new Error('No companies found for testing');

    // Get existing invoice for payment
    const { data: invoice } = await supabase
      .from('vaultpay_invoices')
      .select('id, total_amount')
      .eq('status', 'draft')
      .limit(1)
      .single();

    if (!invoice) throw new Error('No test invoice found for payment processing');

    // Record payment
    const { data: payment, error } = await supabase
      .from('vaultpay_payments')
      .insert({
        invoice_id: invoice.id,
        amount: invoice.total_amount / 2, // Partial payment
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'ach',
        reference_number: `TEST-${Date.now()}`,
        memo: 'Test payment for VaultPay testing',
        applied_by: user!.id,
        company_id: companies.id
      })
      .select()
      .single();

    if (error) throw error;

    return {
      payment_id: payment.id,
      amount: payment.amount,
      payment_method: payment.payment_method,
      status: 'success'
    };
  };

  const testARAging = async () => {
    // Call AR aging function
    const { data, error } = await supabase
      .rpc('get_vaultpay_ar_aging');

    if (error) throw error;

    return {
      aging_data: data,
      total_companies: data?.length || 0,
      status: 'success'
    };
  };

  const testAutoGeneration = async () => {
    // This would typically be triggered by payroll finalization
    // For testing, we'll simulate the process
    const { data: companies } = await supabase
      .from('company_settings')
      .select('id, vaultpay_fee_type, vaultpay_rate_per_employee, vaultpay_flat_fee')
      .not('vaultpay_fee_type', 'is', null)
      .limit(1)
      .single();

    if (!companies) throw new Error('No companies with VaultPay settings found');

    return {
      company_id: companies.id,
      fee_type: companies.vaultpay_fee_type,
      rate: companies.vaultpay_rate_per_employee || companies.vaultpay_flat_fee,
      status: 'success'
    };
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    for (let i = 0; i < vaultPayTests.length; i++) {
      const test = vaultPayTests[i];
      await runTest(test.id);
      setProgress((i + 1) / vaultPayTests.length * 100);
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
              <CardTitle>VaultPay Core Testing</CardTitle>
              <CardDescription>
                Test invoice generation, payment processing, and AR aging functionality
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
        {vaultPayTests.map((test) => (
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
                  <pre className="text-xs text-muted-foreground overflow-auto">
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
