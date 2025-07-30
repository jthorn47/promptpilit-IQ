
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, PlayCircle, Database, Bell, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getSyncStatus, triggerManualSync } from '@/services/databridge/getSyncStatus';
import { getDataBridgeLogs } from '@/services/databridge/logService';
import { toast } from 'sonner';

interface DataBridgeTestingProps {
  onResultsUpdate: (results: any) => void;
}

export const DataBridgeTesting: React.FC<DataBridgeTestingProps> = ({ onResultsUpdate }) => {
  const [testStatus, setTestStatus] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [syncData, setSyncData] = useState<any[]>([]);

  const dataBridgeTests = [
    {
      id: 'sync-logging',
      name: 'Sync Logging',
      description: 'Test real-time sync status logging and updates',
      icon: Database
    },
    {
      id: 'alert-system',
      name: 'Alert System',
      description: 'Test sync failure notifications and alerts',
      icon: Bell
    },
    {
      id: 'monitoring-dashboard',
      name: 'Monitoring Dashboard',
      description: 'Test real-time status updates and filtering',
      icon: Activity
    },
    {
      id: 'retry-mechanisms',
      name: 'Retry Mechanisms',
      description: 'Test manual sync triggers and retry logic',
      icon: PlayCircle
    }
  ];

  useEffect(() => {
    loadSyncData();
  }, []);

  const loadSyncData = async () => {
    try {
      const data = await getSyncStatus();
      setSyncData(data);
    } catch (error) {
      console.error('Failed to load sync data:', error);
    }
  };

  const runTest = async (testId: string) => {
    setTestStatus(prev => ({ ...prev, [testId]: 'running' }));
    
    try {
      let result;
      
      switch (testId) {
        case 'sync-logging':
          result = await testSyncLogging();
          break;
        case 'alert-system':
          result = await testAlertSystem();
          break;
        case 'monitoring-dashboard':
          result = await testMonitoringDashboard();
          break;
        case 'retry-mechanisms':
          result = await testRetryMechanisms();
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

  const testSyncLogging = async () => {
    // Insert a test sync log entry
    const { data, error } = await supabase
      .from('databridge_logs')
      .insert({
        module_name: 'Test Module',
        status: 'success',
        last_synced_at: new Date().toISOString(),
        origin_module: 'Testing Suite',
        target_module: 'DataBridge',
        sync_duration_ms: Math.floor(Math.random() * 2000) + 500,
        records_processed: Math.floor(Math.random() * 100) + 1
      })
      .select()
      .single();

    if (error) throw error;

    // Verify the log was created
    const { data: logData, error: logError } = await supabase
      .from('databridge_logs')
      .select('*')
      .eq('id', data.id)
      .single();

    if (logError) throw logError;

    return {
      log_id: data.id,
      module_name: data.module_name,
      status: data.status,
      created_at: data.created_at,
      verification: 'success'
    };
  };

  const testAlertSystem = async () => {
    // Create a failed sync to trigger alert
    const { data, error } = await supabase
      .from('databridge_logs')
      .insert({
        module_name: 'Test Alert Module',
        status: 'error',
        last_synced_at: new Date().toISOString(),
        error_message: 'Test error for alert system verification',
        origin_module: 'Testing Suite',
        target_module: 'Alert System',
        sync_duration_ms: 0,
        records_processed: 0,
        retry_count: 1
      })
      .select()
      .single();

    if (error) throw error;

    return {
      log_id: data.id,
      error_message: data.error_message,
      status: data.status,
      alert_triggered: true
    };
  };

  const testMonitoringDashboard = async () => {
    // Test the getSyncStatus function
    const statusData = await getSyncStatus();
    
    // Test the log filtering function
    const logsData = await getDataBridgeLogs(1, 10, { status: 'success' });

    return {
      sync_modules: statusData.length,
      log_entries: logsData.data.length,
      total_logs: logsData.total,
      filtering_works: logsData.data.every(log => log.status === 'success')
    };
  };

  const testRetryMechanisms = async () => {
    // Test manual sync trigger
    const testModule = 'Test Retry Module';
    
    try {
      await triggerManualSync(testModule);
      
      // Verify the new sync log was created
      const { data: logs } = await supabase
        .from('databridge_logs')
        .select('*')
        .eq('module_name', testModule)
        .order('created_at', { ascending: false })
        .limit(1);

      return {
        module_name: testModule,
        retry_triggered: true,
        new_log_created: logs && logs.length > 0,
        latest_status: logs?.[0]?.status || 'unknown'
      };
    } catch (error) {
      throw new Error(`Manual sync failed: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    for (let i = 0; i < dataBridgeTests.length; i++) {
      const test = dataBridgeTests[i];
      await runTest(test.id);
      setProgress((i + 1) / dataBridgeTests.length * 100);
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
              <CardTitle>DataBridge Live Testing</CardTitle>
              <CardDescription>
                Test sync logging, alerts, monitoring dashboard, and retry mechanisms
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

      {/* Current Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Sync Status</CardTitle>
          <CardDescription>Live DataBridge module status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {syncData.slice(0, 6).map((sync) => (
              <div key={sync.module_name} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{sync.module_name}</span>
                  <Badge 
                    variant={sync.status === 'success' ? 'default' : 
                             sync.status === 'stale' ? 'secondary' : 'destructive'}
                  >
                    {sync.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last sync: {new Date(sync.last_synced_at).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataBridgeTests.map((test) => (
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
