import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useCorePayrollEngine } from "@/domains/payroll/hooks/useCorePayrollEngine";
import { PayrollCalculationInput } from "@/domains/payroll/engine/types";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Zap,
  Play,
  Eye,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  FileCheck,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

interface PreflightCheck {
  id: string;
  category: 'validation' | 'warning' | 'optimization';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  auto_fixable: boolean;
  fix_description?: string;
}

interface ConfidenceMeter {
  overall_score: number;
  factors: {
    data_quality: number;
    compliance_check: number;
    anomaly_detection: number;
    calculation_accuracy: number;
  };
}

interface PreflightSimulationProps {
  payrollInputs: PayrollCalculationInput[];
  onProceedWithPayroll: () => void;
  onViewDetails: () => void;
}

export const PreflightSimulation: React.FC<PreflightSimulationProps> = ({
  payrollInputs,
  onProceedWithPayroll,
  onViewDetails
}) => {
  const [checks, setChecks] = useState<PreflightCheck[]>([]);
  const [confidence, setConfidence] = useState<ConfidenceMeter | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [step, setStep] = useState(0);

  const { simulatePayroll, isMockMode } = useCorePayrollEngine();

  const steps = [
    'Data Validation',
    'HALO Analysis', 
    'Compliance Check',
    'Anomaly Detection',
    'Final Review'
  ];

  useEffect(() => {
    runPreflightChecks();
  }, [payrollInputs]);

  const runPreflightChecks = async () => {
    setIsRunning(true);
    setStep(0);

    // Simulate progressive checking
    for (let i = 0; i < steps.length; i++) {
      setStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Mock preflight results
    const mockChecks: PreflightCheck[] = [
      {
        id: '1',
        category: 'validation',
        severity: 'high',
        title: 'Employee Data Complete',
        description: 'All required employee information present for payroll calculation',
        status: 'pass',
        auto_fixable: false
      },
      {
        id: '2',
        category: 'warning',
        severity: 'medium',
        title: 'Overtime Threshold Alert',
        description: '3 employees will exceed 40 hours this pay period',
        status: 'warning',
        auto_fixable: false
      },
      {
        id: '3',
        category: 'optimization',
        severity: 'low',
        title: 'Tax Optimization Available',
        description: 'Pre-tax deductions could be optimized for 2 employees',
        status: 'warning',
        auto_fixable: true,
        fix_description: 'Auto-adjust pre-tax deduction ordering'
      },
      {
        id: '4',
        category: 'validation',
        severity: 'high',
        title: 'FUTA Cap Check',
        description: 'Verified FUTA wage caps for all employees',
        status: 'pass',
        auto_fixable: false
      },
      {
        id: '5',
        category: 'warning',
        severity: 'medium',
        title: 'State Tax Update',
        description: 'California SDI rate updated this quarter - calculations adjusted',
        status: 'pass',
        auto_fixable: true,
        fix_description: 'Auto-applied latest CA SDI rate (1.1%)'
      }
    ];

    const mockConfidence: ConfidenceMeter = {
      overall_score: 92,
      factors: {
        data_quality: 95,
        compliance_check: 98,
        anomaly_detection: 85,
        calculation_accuracy: 90
      }
    };

    setChecks(mockChecks);
    setConfidence(mockConfidence);
    setCompleted(true);
    setIsRunning(false);
  };

  const applyAutoFix = async (checkId: string) => {
    const check = checks.find(c => c.id === checkId);
    if (!check?.auto_fixable) return;

    // Simulate auto-fix
    toast.success(`Auto-fix applied: ${check.fix_description}`);
    
    setChecks(prev => prev.map(c => 
      c.id === checkId 
        ? { ...c, status: 'pass' as const }
        : c
    ));

    // Recalculate confidence after fix
    if (confidence) {
      setConfidence(prev => prev ? {
        ...prev,
        overall_score: Math.min(100, prev.overall_score + 2)
      } : null);
    }
  };

  const getCheckIcon = (status: string, severity: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className={`h-4 w-4 ${severity === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLevel = (score: number) => {
    if (score >= 95) return 'Excellent';
    if (score >= 90) return 'High';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Low';
  };

  const passedChecks = checks.filter(c => c.status === 'pass').length;
  const warningChecks = checks.filter(c => c.status === 'warning').length;
  const failedChecks = checks.filter(c => c.status === 'fail').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Preflight Simulation & Confidence Meter
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isMockMode && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Running in Mock Mode - Results are simulated for testing purposes
              </AlertDescription>
            </Alert>
          )}

          {isRunning && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-lg font-semibold mb-2">Running Preflight Checks</div>
                <Progress value={(step + 1) / steps.length * 100} className="h-3" />
                <div className="text-sm text-muted-foreground mt-2">
                  {step < steps.length ? steps[step] : 'Complete'}
                </div>
              </div>
            </div>
          )}

          {completed && confidence && (
            <div className="space-y-6">
              {/* Confidence Meter */}
              <div className="text-center">
                <div className="mb-4">
                  <div className={`text-4xl font-bold ${getConfidenceColor(confidence.overall_score)}`}>
                    {confidence.overall_score}%
                  </div>
                  <div className="text-lg font-medium text-muted-foreground">
                    {getConfidenceLevel(confidence.overall_score)} Confidence
                  </div>
                  <Progress value={confidence.overall_score} className="mt-2 h-3" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Data Quality</div>
                    <div className="text-2xl font-bold text-green-600">{confidence.factors.data_quality}%</div>
                  </div>
                  <div>
                    <div className="font-medium">Compliance</div>
                    <div className="text-2xl font-bold text-green-600">{confidence.factors.compliance_check}%</div>
                  </div>
                  <div>
                    <div className="font-medium">Anomaly Check</div>
                    <div className="text-2xl font-bold text-yellow-600">{confidence.factors.anomaly_detection}%</div>
                  </div>
                  <div>
                    <div className="font-medium">Accuracy</div>
                    <div className="text-2xl font-bold text-green-600">{confidence.factors.calculation_accuracy}%</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{passedChecks}</div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{warningChecks}</div>
                  <div className="text-sm text-muted-foreground">Warnings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{failedChecks}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={onProceedWithPayroll}
                  className="flex-1"
                  disabled={failedChecks > 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Proceed with Payroll
                </Button>
                <Button variant="outline" onClick={onViewDetails}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Checks */}
      {completed && (
        <Card>
          <CardHeader>
            <CardTitle>HALO-Generated Warnings & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checks.map((check) => (
                <div key={check.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  {getCheckIcon(check.status, check.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{check.title}</span>
                      <Badge variant={
                        check.status === 'pass' ? 'default' :
                        check.status === 'warning' ? 'secondary' : 'destructive'
                      }>
                        {check.category}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {check.description}
                    </div>
                    {check.auto_fixable && check.status !== 'pass' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => applyAutoFix(check.id)}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Auto-Fix: {check.fix_description}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};