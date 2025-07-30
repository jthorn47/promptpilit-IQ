import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, AlertTriangle, DollarSign, MapPin } from "lucide-react";

interface WageComplianceProps {
  employeeId: string;
  hourlyRate?: number;
  annualSalary?: number;
  payType: 'hourly' | 'salary';
  exemptStatus?: 'exempt' | 'non_exempt';
  workLocation: {
    city?: string;
    county?: string;
    state: string;
    zipCode?: string;
  };
  jobTitle?: string;
}

interface ComplianceResult {
  isCompliant: boolean;
  status: 'compliant' | 'non_compliant' | 'warning';
  requiredRate: number;
  actualRate: number;
  gap: number;
  jurisdiction: string;
  details: string;
}

export function WageCheckIQ({
  employeeId,
  hourlyRate,
  annualSalary,
  payType,
  exemptStatus,
  workLocation,
  jobTitle,
}: WageComplianceProps) {
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkWageCompliance();
  }, [employeeId, hourlyRate, annualSalary, payType, workLocation]);

  const checkWageCompliance = async () => {
    try {
      setLoading(true);
      setError(null);

      if (payType === 'hourly' && hourlyRate) {
        const result = await checkHourlyWageCompliance();
        setComplianceResult(result);
      } else if (payType === 'salary' && annualSalary && exemptStatus === 'exempt') {
        const result = await checkSalaryCompliance();
        setComplianceResult(result);
      }

      // TODO: Log compliance check when table types are updated
      // await supabase.from('wage_compliance_checks').insert({
      //   employee_id: employeeId,
      //   compliance_status: complianceResult?.status || 'compliant',
      //   wage_type: payType,
      //   applicable_jurisdiction: complianceResult?.jurisdiction,
      //   required_rate: complianceResult?.requiredRate,
      //   actual_rate: complianceResult?.actualRate,
      //   gap_amount: complianceResult?.gap,
      //   violation_details: {
      //     work_location: workLocation,
      //     job_title: jobTitle,
      //     exempt_status: exemptStatus,
      //   },
      // });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkHourlyWageCompliance = async (): Promise<ComplianceResult> => {
    // Mock wage rates until table types are updated
    const mockWageRates = [
      {
        id: '1',
        jurisdiction_name: workLocation.state,
        state_code: workLocation.state,
        jurisdiction_level: 'state',
        minimum_hourly: 15.00,
        effective_date: '2024-01-01'
      }
    ];

    // Find most specific applicable rate
    let applicableRate = mockWageRates.find(rate => 
      rate.state_code === workLocation.state
    );

    if (!applicableRate) {
      throw new Error('No applicable minimum wage rate found');
    }

    const requiredRate = applicableRate.minimum_hourly;
    const actualRate = hourlyRate || 0;
    const gap = Math.max(0, requiredRate - actualRate);
    const isCompliant = actualRate >= requiredRate;

    return {
      isCompliant,
      status: isCompliant ? 'compliant' : 'non_compliant',
      requiredRate,
      actualRate,
      gap,
      jurisdiction: `${applicableRate.jurisdiction_name} (${applicableRate.jurisdiction_level})`,
      details: isCompliant 
        ? `Meets ${applicableRate.jurisdiction_name} minimum wage of $${requiredRate}/hour`
        : `Below ${applicableRate.jurisdiction_name} minimum wage by $${gap.toFixed(2)}/hour`,
    };
  };

  const checkSalaryCompliance = async (): Promise<ComplianceResult> => {
    // Mock salary threshold until table types are updated
    const mockThreshold = {
      annual_salary_minimum: 35568, // Federal minimum for 2024
      state_code: workLocation.state
    };

    const requiredSalary = mockThreshold.annual_salary_minimum || 0;
    const actualSalary = annualSalary || 0;
    const gap = Math.max(0, requiredSalary - actualSalary);
    const isCompliant = actualSalary >= requiredSalary;

    return {
      isCompliant,
      status: isCompliant ? 'compliant' : 'non_compliant',
      requiredRate: requiredSalary,
      actualRate: actualSalary,
      gap,
      jurisdiction: `${workLocation.state} State`,
      details: isCompliant
        ? `Meets ${workLocation.state} exempt salary threshold of $${requiredSalary.toLocaleString()}/year`
        : `Below ${workLocation.state} exempt salary threshold by $${gap.toLocaleString()}/year`,
    };
  };

  const getStatusIcon = () => {
    if (!complianceResult) return <DollarSign className="h-4 w-4" />;
    
    switch (complianceResult.status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'non_compliant':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusBadge = () => {
    if (!complianceResult) return null;
    
    switch (complianceResult.status) {
      case 'compliant':
        return <Badge variant="default" className="bg-green-100 text-green-800">Compliant</Badge>;
      case 'non_compliant':
        return <Badge variant="destructive">Non-Compliant</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            WageCheckIQ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            WageCheckIQ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Error checking wage compliance: {error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            WageCheckIQ
          </div>
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Minimum wage compliance verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {complianceResult && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Required Rate</div>
                <div className="text-lg font-semibold">
                  {payType === 'hourly' 
                    ? `$${complianceResult.requiredRate}/hour`
                    : `$${complianceResult.requiredRate.toLocaleString()}/year`
                  }
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Actual Rate</div>
                <div className="text-lg font-semibold">
                  {payType === 'hourly' 
                    ? `$${complianceResult.actualRate}/hour`
                    : `$${complianceResult.actualRate.toLocaleString()}/year`
                  }
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Jurisdiction:</span>
              <span>{complianceResult.jurisdiction}</span>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm">{complianceResult.details}</div>
              {complianceResult.gap > 0 && (
                <div className="text-sm font-medium text-red-600 mt-1">
                  Gap: {payType === 'hourly' 
                    ? `$${complianceResult.gap.toFixed(2)}/hour`
                    : `$${complianceResult.gap.toLocaleString()}/year`
                  }
                </div>
              )}
            </div>

            {!complianceResult.isCompliant && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This employee's pay is below the minimum wage requirement. 
                  Immediate action is required to ensure compliance.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}