/**
 * Batch Monitor Component
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  PlayCircle, 
  PauseCircle, 
  CheckCircle, 
  AlertCircle,
  StopCircle,
  RefreshCw,
  Download,
  Eye,
  Clock,
  Zap,
  Activity
} from 'lucide-react';

interface BatchProcess {
  id: string;
  batchName: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'paused';
  progress: number;
  currentStep: string;
  totalSteps: number;
  currentStepNumber: number;
  employeeCount: number;
  processedCount: number;
  startTime: string;
  estimatedCompletion: string;
  errorCount: number;
}

const BatchMonitor: React.FC = () => {
  const [processes, setProcesses] = useState<BatchProcess[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data - in real implementation, this would come from real-time API
  useEffect(() => {
    const mockProcesses: BatchProcess[] = [
      {
        id: '1',
        batchName: 'Weekly Payroll - Week 04/2024',
        status: 'processing',
        progress: 65,
        currentStep: 'Calculating tax withholdings',
        totalSteps: 8,
        currentStepNumber: 5,
        employeeCount: 42,
        processedCount: 27,
        startTime: '2024-01-22T09:15:00Z',
        estimatedCompletion: '2024-01-22T09:45:00Z',
        errorCount: 0
      },
      {
        id: '2',
        batchName: 'Bonus Payroll - Q4 2023',
        status: 'queued',
        progress: 0,
        currentStep: 'Waiting to start',
        totalSteps: 6,
        currentStepNumber: 0,
        employeeCount: 38,
        processedCount: 0,
        startTime: '',
        estimatedCompletion: '',
        errorCount: 0
      },
      {
        id: '3',
        batchName: 'Correction Batch - Jan 2024',
        status: 'failed',
        progress: 45,
        currentStep: 'Error in ACH file generation',
        totalSteps: 8,
        currentStepNumber: 6,
        employeeCount: 12,
        processedCount: 5,
        startTime: '2024-01-22T08:30:00Z',
        estimatedCompletion: '',
        errorCount: 3
      }
    ];

    setProcesses(mockProcesses);

    // Simulate real-time updates
    if (autoRefresh) {
      const interval = setInterval(() => {
        setProcesses(prev => prev.map(process => {
          if (process.status === 'processing' && process.progress < 100) {
            return {
              ...process,
              progress: Math.min(100, process.progress + Math.random() * 10),
              processedCount: Math.min(process.employeeCount, process.processedCount + Math.floor(Math.random() * 3))
            };
          }
          return process;
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary"><PlayCircle className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'queued':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Queued</Badge>;
      case 'paused':
        return <Badge variant="outline"><PauseCircle className="w-3 h-3 mr-1" />Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      case 'paused':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-300';
    }
  };

  const activeBatches = processes.filter(p => ['processing', 'queued'].includes(p.status)).length;
  const completedBatches = processes.filter(p => p.status === 'completed').length;
  const failedBatches = processes.filter(p => p.status === 'failed').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Batch Monitor</h1>
          <p className="text-muted-foreground">Real-time monitoring of payroll batch processing</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="w-4 h-4 mr-2" />
            {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBatches}</div>
            <p className="text-xs text-muted-foreground">Currently processing or queued</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedBatches}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedBatches}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12m</div>
            <p className="text-xs text-muted-foreground">Average completion time</p>
          </CardContent>
        </Card>
      </div>

      {/* Processing Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Queue</CardTitle>
          <CardDescription>Monitor the progress of payroll batch processing in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {processes.map((process) => (
              <div key={process.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold">{process.batchName}</h3>
                    {getStatusBadge(process.status)}
                  </div>
                  <div className="flex space-x-2">
                    {process.status === 'processing' && (
                      <Button variant="outline" size="sm">
                        <PauseCircle className="w-4 h-4 mr-1" />
                        Pause
                      </Button>
                    )}
                    {process.status === 'failed' && (
                      <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Retry
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {process.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{process.currentStep}</span>
                    <span>
                      {process.processedCount}/{process.employeeCount} employees
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(process.status)}`}
                      style={{ width: `${process.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Step {process.currentStepNumber}/{process.totalSteps}</span>
                    <span>{Math.round(process.progress)}% complete</span>
                  </div>
                </div>

                {/* Timing Information */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Started:</span>
                    <div className="font-medium">{formatTime(process.startTime)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ETA:</span>
                    <div className="font-medium">{formatTime(process.estimatedCompletion)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Employees:</span>
                    <div className="font-medium">{process.employeeCount}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Errors:</span>
                    <div className={`font-medium ${process.errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {process.errorCount}
                    </div>
                  </div>
                </div>

                {/* Error Details */}
                {process.errorCount > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-sm font-medium text-red-800">
                        {process.errorCount} error(s) encountered
                      </span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      Click "View" to see detailed error information and resolution steps.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchMonitor;