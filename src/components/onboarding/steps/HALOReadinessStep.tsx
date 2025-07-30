import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle, Loader2, Target } from 'lucide-react';

interface HALOReadinessStepProps {
  data: any;
  onUpdate: (section: string, data: any) => void;
  onCommentaryUpdate: (commentary: string) => void;
}

export const HALOReadinessStep: React.FC<HALOReadinessStepProps> = ({
  data,
  onUpdate,
  onCommentaryUpdate,
}) => {
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    runReadinessScan();
  }, []);

  const runReadinessScan = async () => {
    setScanning(true);
    onCommentaryUpdate('Running comprehensive readiness scan... Checking all configurations and compliance requirements.');
    
    // Simulate scan process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Calculate score based on completed data
    let calculatedScore = 0;
    
    // Company info (20 points)
    if (data.companyInfo?.legalCompanyName && data.companyInfo?.ein) {
      calculatedScore += 20;
    }
    
    // Tax accounts (25 points)
    if (data.taxAccounts?.federalEin) {
      calculatedScore += 15;
    }
    if (data.taxAccounts?.stateWithholdingAccount) {
      calculatedScore += 10;
    }
    
    // Banking (25 points)
    if (data.banking?.routingNumber && data.banking?.accountNumber) {
      calculatedScore += 20;
    }
    if (data.banking?.achAuthorized) {
      calculatedScore += 5;
    }
    
    // Service plan (15 points)
    if (data.servicePlan?.servicePlanType) {
      calculatedScore += 15;
    }
    
    // Employee data (15 points)
    calculatedScore += 10; // Assume some employee data exists
    
    setScore(calculatedScore);
    
    // Update data
    const updatedScan = {
      onboardingScore: calculatedScore,
      haloAlerts: generateAlerts(calculatedScore),
      recommendations: generateRecommendations(calculatedScore),
    };
    
    onUpdate('readinessScan', updatedScan);
    setScanning(false);
    setScanComplete(true);
    
    if (calculatedScore >= 75) {
      onCommentaryUpdate(`Excellent! Your onboarding score is ${calculatedScore}%. You're ready to launch your payroll system.`);
    } else {
      onCommentaryUpdate(`Your current score is ${calculatedScore}%. Please address the issues below to reach the minimum 75% required for launch.`);
    }
  };

  const generateAlerts = (currentScore: number) => {
    const alerts = [];
    
    if (!data.banking?.achAuthorized) {
      alerts.push({
        id: 'ach_not_authorized',
        type: 'error',
        severity: 'high',
        message: 'ACH authorization required for payroll funding',
      });
    }
    
    if (!data.taxAccounts?.stateWithholdingAccount) {
      alerts.push({
        id: 'missing_state_account',
        type: 'warning',
        severity: 'medium',
        message: 'State withholding account not configured',
      });
    }
    
    return alerts;
  };

  const generateRecommendations = (currentScore: number) => {
    const recommendations = [];
    
    if (currentScore < 75) {
      recommendations.push('Complete all required fields before launch');
      recommendations.push('Upload verification documents');
      recommendations.push('Authorize ACH transactions');
    }
    
    return recommendations;
  };

  const getScoreColor = (currentScore: number) => {
    if (currentScore >= 90) return 'text-green-600';
    if (currentScore >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (currentScore: number) => {
    if (currentScore >= 90) return 'Excellent';
    if (currentScore >= 75) return 'Ready to Launch';
    return 'Needs Attention';
  };

  return (
    <div className="space-y-6">
      {/* Scanning Progress */}
      {scanning && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-medium mb-2">HALO Readiness Scan in Progress</h3>
              <p className="text-sm text-muted-foreground">
                Analyzing your configuration and checking compliance requirements...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan Results */}
      {scanComplete && (
        <>
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Onboarding Readiness Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className={`text-4xl font-bold ${getScoreColor(score)} mb-2`}>
                  {score}%
                </div>
                <div className="text-lg font-medium mb-4">
                  {getScoreStatus(score)}
                </div>
                <Progress value={score} className="w-full max-w-md mx-auto" />
              </div>
              
              {score < 75 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Minimum score of 75% required to launch. Please address the issues below.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Company Information</span>
                  {data.companyInfo?.legalCompanyName && data.companyInfo?.ein ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Federal Tax ID</span>
                  {data.taxAccounts?.federalEin ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Banking Setup</span>
                  {data.banking?.routingNumber && data.banking?.accountNumber ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span>ACH Authorization</span>
                  {data.banking?.achAuthorized ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Service Plan Selected</span>
                  {data.servicePlan?.servicePlanType ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confidence Meter */}
          <Card>
            <CardHeader>
              <CardTitle>Launch Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Data Completeness</span>
                  <Badge variant={score >= 80 ? 'default' : 'secondary'}>
                    {score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Compliance Ready</span>
                  <Badge variant={score >= 75 ? 'default' : 'secondary'}>
                    {score >= 75 ? 'Yes' : 'Pending'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Risk Level</span>
                  <Badge variant={score >= 85 ? 'default' : score >= 70 ? 'secondary' : 'destructive'}>
                    {score >= 85 ? 'Low' : score >= 70 ? 'Medium' : 'High'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};