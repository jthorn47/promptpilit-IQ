
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePhase1Validation } from '@/hooks/usePhase1Validation';
import { CheckCircle, AlertTriangle, XCircle, Play, RefreshCw } from 'lucide-react';

export const Phase1Dashboard = () => {
  const { 
    runValidation, 
    useSystemHealth, 
    runPhase1CompletionCheck,
    isValidating,
    isRunningCompletionCheck 
  } = usePhase1Validation();

  const { data: systemHealth, isLoading: healthLoading } = useSystemHealth();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <RefreshCw className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'fail': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const phase1Requirements = [
    {
      id: 'tax_versioning',
      title: '2024 Tax Rules Archived & 2025 Loaded',
      description: 'Tax rules archived and versioned correctly',
      test_type: 'tax_calculation' as const
    },
    {
      id: 'audit_trail',
      title: 'Tax Calculations Audit Trail',
      description: 'Every payroll tax calculation logged with metadata',
      test_type: 'audit_trail' as const
    },
    {
      id: 'ytd_accumulators',
      title: 'YTD Accumulators Active',
      description: 'Tax and wage YTD tracking operational',
      test_type: 'ytd_accumulator' as const
    },
    {
      id: 'system_health',
      title: 'System Health Check',
      description: 'Overall infrastructure validation',
      test_type: 'system_health' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Phase 1 - Core Infrastructure</h2>
          <p className="text-muted-foreground">
            TaxIQ and WageCheckIQ foundation validation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => runPhase1CompletionCheck.mutate()}
            disabled={isRunningCompletionCheck}
            variant="outline"
          >
            {isRunningCompletionCheck ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run Full Validation
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {healthLoading ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              getStatusIcon(systemHealth?.status || 'unknown')
            )}
            System Health Overview
          </CardTitle>
          <CardDescription>
            Real-time infrastructure monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          {healthLoading ? (
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Checking system health...</span>
            </div>
          ) : systemHealth ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Status</span>
                <Badge className={getStatusColor(systemHealth.status)}>
                  {systemHealth.status.toUpperCase()}
                </Badge>
              </div>
              
              {systemHealth.details?.health_checks && (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(systemHealth.details.health_checks).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                      {value ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {systemHealth.details?.issues && systemHealth.details.issues.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-red-600 mb-2">Issues Detected:</h4>
                  <ul className="text-sm text-red-600 space-y-1">
                    {systemHealth.details.issues.map((issue: string, index: number) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Unable to load system health data</p>
          )}
        </CardContent>
      </Card>

      {/* Phase 1 Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {phase1Requirements.map((requirement) => (
          <Card key={requirement.id}>
            <CardHeader>
              <CardTitle className="text-lg">{requirement.title}</CardTitle>
              <CardDescription>{requirement.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => runValidation.mutate({
                  test_type: requirement.test_type,
                  test_year: new Date().getFullYear()
                })}
                disabled={isValidating}
                variant="outline"
                className="w-full"
              >
                {isValidating ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Test Component
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Phase 1 Completion Status</CardTitle>
          <CardDescription>
            Track progress toward Phase 2 readiness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Core Infrastructure</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm">Tax Engine</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm">Audit Trail</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">○</div>
                <div className="text-sm">Final Validation</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
