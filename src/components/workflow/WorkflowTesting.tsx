import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Play, TestTube, Zap } from "lucide-react";

export const WorkflowTesting = () => {
  const [testType, setTestType] = useState<string>('stripe-purchase');
  const [testData, setTestData] = useState({
    customer_email: 'test@example.com',
    customer_name: 'Test Customer',
    company_name: 'Test Company Inc',
    amount: 99.99,
    sku: 'SB553-PLAN'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const runTest = async () => {
    setIsLoading(true);
    try {
      let response;
      
      switch (testType) {
        case 'stripe-purchase':
          response = await supabase.functions.invoke('workflow-engine', {
            body: {
              trigger_type: 'purchase',
              trigger_value: testData.sku,
              context_data: {
                customer_email: testData.customer_email,
                customer_name: testData.customer_name,
                company_name: testData.company_name,
                amount: testData.amount,
                source: 'test'
              }
            }
          });
          break;
          
        case 'direct-workflow':
          response = await supabase.functions.invoke('workflow-engine', {
            body: {
              workflow_id: 'sb553-purchase',
              context_data: testData
            }
          });
          break;
          
        default:
          throw new Error('Unknown test type');
      }

      if (response.error) {
        throw response.error;
      }

      setLastResult(response.data);
      toast.success('Test executed successfully!');
      
    } catch (error) {
      console.error('Test failed:', error);
      toast.error(`Test failed: ${error.message}`);
      setLastResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const presetTests = [
    {
      name: 'SB553 Plan Purchase',
      type: 'stripe-purchase',
      data: {
        customer_email: 'demo@company.com',
        customer_name: 'Demo Customer',
        company_name: 'Demo Company LLC',
        amount: 149.99,
        sku: 'SB553-PLAN'
      }
    },
    {
      name: 'Large Enterprise Purchase',
      type: 'stripe-purchase',
      data: {
        customer_email: 'procurement@enterprise.com',
        customer_name: 'Jane Smith',
        company_name: 'Enterprise Corp',
        amount: 499.99,
        sku: 'SB553-PLAN'
      }
    }
  ];

  const loadPreset = (preset: any) => {
    setTestType(preset.type);
    setTestData(preset.data);
    toast.info(`Loaded preset: ${preset.name}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Workflow Testing Environment
          </CardTitle>
          <CardDescription>
            Test workflows in a safe environment using Stripe test mode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preset Tests */}
          <div>
            <Label className="text-sm font-semibold">Quick Test Presets</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {presetTests.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => loadPreset(preset)}
                >
                  <div className="text-left">
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {preset.data.company_name} - ${preset.data.amount}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Test Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="test-type">Test Type</Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe-purchase">Stripe Purchase Event</SelectItem>
                  <SelectItem value="direct-workflow">Direct Workflow Trigger</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sku">Product SKU</Label>
              <Input
                id="sku"
                value={testData.sku}
                onChange={(e) => setTestData({ ...testData, sku: e.target.value })}
                placeholder="SB553-PLAN"
              />
            </div>

            <div>
              <Label htmlFor="customer-email">Customer Email</Label>
              <Input
                id="customer-email"
                type="email"
                value={testData.customer_email}
                onChange={(e) => setTestData({ ...testData, customer_email: e.target.value })}
                placeholder="test@example.com"
              />
            </div>

            <div>
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input
                id="customer-name"
                value={testData.customer_name}
                onChange={(e) => setTestData({ ...testData, customer_name: e.target.value })}
                placeholder="Test Customer"
              />
            </div>

            <div>
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={testData.company_name}
                onChange={(e) => setTestData({ ...testData, company_name: e.target.value })}
                placeholder="Test Company Inc"
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={testData.amount}
                onChange={(e) => setTestData({ ...testData, amount: parseFloat(e.target.value) })}
                placeholder="99.99"
              />
            </div>
          </div>

          {/* Test Execution */}
          <div className="flex gap-3">
            <Button 
              onClick={runTest} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Zap className="h-4 w-4 animate-pulse" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isLoading ? 'Running Test...' : 'Run Test'}
            </Button>
          </div>

          {/* Test Results */}
          {lastResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={JSON.stringify(lastResult, null, 2)}
                  readOnly
                  className="font-mono text-sm"
                  rows={10}
                />
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};