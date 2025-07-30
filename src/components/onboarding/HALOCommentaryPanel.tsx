import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react';

interface HALOCommentaryPanelProps {
  commentary: string;
  currentStep: number;
  onboardingScore: number;
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

export const HALOCommentaryPanel: React.FC<HALOCommentaryPanelProps> = ({
  commentary,
  currentStep,
  onboardingScore,
  alerts,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Critical Issues';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* HALO Assistant */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="w-5 h-5 text-primary" />
            HALO Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
            <p className="text-sm text-foreground">{commentary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Score */}
      {currentStep >= 3 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              Readiness Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(onboardingScore)}`}>
                {onboardingScore}%
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                {getScoreStatus(onboardingScore)}
              </div>
              
              {onboardingScore < 75 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Score must be ≥75% to launch
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* HALO Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5" />
              Active Alerts
              <Badge variant="secondary">{alerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id}>
                  {getAlertIcon(alert.type)}
                  <AlertDescription className="ml-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{alert.message}</span>
                      <Badge 
                        variant={
                          alert.severity === 'critical' ? 'destructive' :
                          alert.severity === 'high' ? 'destructive' :
                          alert.severity === 'medium' ? 'default' : 'secondary'
                        }
                        className="ml-2"
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {currentStep === 1 && (
              <div>
                <h4 className="font-medium mb-1">Company Information</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Have your EIN ready</li>
                  <li>Ensure legal name matches IRS records</li>
                  <li>Entity type affects tax requirements</li>
                </ul>
              </div>
            )}
            
            {currentStep === 2 && (
              <div>
                <h4 className="font-medium mb-1">Tax Accounts</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>State accounts vary by location</li>
                  <li>Power of Attorney required for filing</li>
                  <li>Some registrations take time</li>
                </ul>
              </div>
            )}
            
            {currentStep === 3 && (
              <div>
                <h4 className="font-medium mb-1">Banking Setup</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Business checking accounts only</li>
                  <li>Voided check speeds verification</li>
                  <li>ACH authorization required</li>
                </ul>
              </div>
            )}
            
            {currentStep === 4 && (
              <div>
                <h4 className="font-medium mb-1">Employee Import</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Use provided Excel template</li>
                  <li>SSN and pay rates required</li>
                  <li>Address affects tax withholding</li>
                </ul>
              </div>
            )}
            
            {currentStep === 5 && (
              <div>
                <h4 className="font-medium mb-1">Service Plans</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>ASO: You remain employer of record</li>
                  <li>PEO: We become co-employer</li>
                  <li>Add-ons available anytime</li>
                </ul>
              </div>
            )}
            
            {currentStep >= 6 && (
              <div>
                <h4 className="font-medium mb-1">Ready to Launch</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>HALO will monitor continuously</li>
                  <li>Support team notified</li>
                  <li>First payroll can be scheduled</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};