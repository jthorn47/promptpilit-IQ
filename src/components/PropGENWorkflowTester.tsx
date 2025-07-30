import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  trigger: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  timestamp: string;
}

export const PropGENWorkflowTester = () => {
  const [testCompanyId, setTestCompanyId] = useState('test-company-123');
  const [testCompanyName, setTestCompanyName] = useState('Test Company Inc');
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const systemTriggers = [
    {
      id: 'risk_assessment_completed',
      name: 'Risk Assessment → Enable PropGEN',
      description: 'Tests automatic PropGEN module enablement',
      icon: CheckCircle
    },
    {
      id: 'proposal_generated',
      name: 'Proposal Generated → Update Stage',
      description: 'Tests automatic stage update to "Proposal Sent"',
      icon: ArrowRight
    },
    {
      id: 'spin_content_generated',
      name: 'SPIN Content → Update Workflow',
      description: 'Tests SPIN content completion workflow',
      icon: Settings
    }
  ];

  const testTrigger = async (triggerType: string, triggerName: string) => {
    setTesting(triggerType);
    
    const testResult: TestResult = {
      trigger: triggerName,
      status: 'pending',
      message: 'Sending test trigger...',
      timestamp: new Date().toISOString()
    };
    
    setTestResults(prev => [testResult, ...prev]);

    try {
      await supabase.functions.invoke('propgen-integration-handler', {
        body: {
          triggerType,
          companyId: testCompanyId,
          triggerData: {
            test_mode: true,
            trigger_name: triggerName,
            company_name: testCompanyName,
            triggered_at: new Date().toISOString(),
            test_data: {
              risk_score: 85,
              risk_level: 'medium',
              assessment_date: new Date().toISOString()
            }
          }
        }
      });

      // Update the test result
      setTestResults(prev => prev.map(result => 
        result.timestamp === testResult.timestamp 
          ? { ...result, status: 'success' as const, message: 'Test trigger sent successfully! Check your configured webhooks/integrations for the notification.' }
          : result
      ));

      toast({
        title: "Test Sent",
        description: `${triggerName} test trigger executed successfully`,
      });
    } catch (error) {
      console.error('Error testing trigger:', error);
      
      // Update the test result
      setTestResults(prev => prev.map(result => 
        result.timestamp === testResult.timestamp 
          ? { ...result, status: 'error' as const, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }
          : result
      ));

      toast({
        title: "Test Failed",
        description: `Failed to test ${triggerName}`,
        variant: "destructive",
      });
    } finally {
      setTesting(null);
    }
  };

  const testAllTriggers = async () => {
    for (const trigger of systemTriggers) {
      await testTrigger(trigger.id, trigger.name);
      // Add a small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>PropGEN Workflow Testing</CardTitle>
          <p className="text-sm text-muted-foreground">
            Test the system-wide PropGEN workflow triggers to ensure they're working correctly
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="test-company-id">Test Company ID</Label>
              <Input
                id="test-company-id"
                value={testCompanyId}
                onChange={(e) => setTestCompanyId(e.target.value)}
                placeholder="Enter test company ID"
              />
            </div>
            <div>
              <Label htmlFor="test-company-name">Test Company Name</Label>
              <Input
                id="test-company-name"
                value={testCompanyName}
                onChange={(e) => setTestCompanyName(e.target.value)}
                placeholder="Enter test company name"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={testAllTriggers} disabled={testing !== null}>
              {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Test All Triggers
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Individual Trigger Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Trigger Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemTriggers.map((trigger) => {
              const IconComponent = trigger.icon;
              return (
                <div key={trigger.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{trigger.name}</p>
                      <p className="text-xs text-muted-foreground">{trigger.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testTrigger(trigger.id, trigger.name)}
                    disabled={testing !== null}
                  >
                    {testing === trigger.id ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3 mr-1" />
                    )}
                    Test
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <p className="font-medium text-sm">{result.trigger}</p>
                      <p className="text-xs text-muted-foreground">{result.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(result.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};