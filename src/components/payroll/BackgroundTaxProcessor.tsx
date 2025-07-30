
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Play, Eye } from 'lucide-react';
import { useBackgroundTaxProcessing } from '@/hooks/useBackgroundTaxProcessing';

interface BackgroundTaxProcessorProps {
  payrollRunId?: string;
  companyId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  isPreview?: boolean;
}

export const BackgroundTaxProcessor: React.FC<BackgroundTaxProcessorProps> = ({
  payrollRunId,
  companyId,
  payPeriodStart,
  payPeriodEnd,
  payDate,
  isPreview = false
}) => {
  const {
    triggerTaxCalculations,
    useTaxCalculationStatus,
    previewTaxCalculations,
    isTriggering,
    isPreviewing
  } = useBackgroundTaxProcessing();

  const { data: taxStatus, isLoading } = useTaxCalculationStatus(payrollRunId || '');

  const handleTriggerCalculations = () => {
    if (!payrollRunId) return;
    
    triggerTaxCalculations.mutate({
      payroll_run_id: payrollRunId,
      company_id: companyId,
      pay_period_start: payPeriodStart,
      pay_period_end: payPeriodEnd,
      pay_date: payDate,
      is_preview: false
    });
  };

  const handlePreviewCalculations = () => {
    previewTaxCalculations.mutate({
      payroll_run_id: payrollRunId || 'preview',
      company_id: companyId,
      pay_period_start: payPeriodStart,
      pay_period_end: payPeriodEnd,
      pay_date: payDate,
      is_preview: true
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const totalEmployeeTax = taxStatus?.reduce((sum, calc) => sum + calc.total_employee_taxes, 0) || 0;
  const totalEmployerTax = taxStatus?.reduce((sum, calc) => sum + calc.total_employer_taxes, 0) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>TaxIQ Background Processing</span>
          {taxStatus && taxStatus.length > 0 && getStatusBadge('completed')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handlePreviewCalculations}
            disabled={isPreviewing}
            variant="outline"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            {isPreviewing ? 'Previewing...' : 'Preview Taxes'}
          </Button>
          
          {payrollRunId && (
            <Button
              onClick={handleTriggerCalculations}
              disabled={isTriggering || !payrollRunId}
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              {isTriggering ? 'Processing...' : 'Calculate Taxes'}
            </Button>
          )}
        </div>

        {/* Tax Calculation Summary */}
        {taxStatus && taxStatus.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-900">Employees Processed</div>
                <div className="text-2xl font-bold text-blue-700">{taxStatus.length}</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="font-semibold text-green-900">Employee Taxes</div>
                <div className="text-2xl font-bold text-green-700">${totalEmployeeTax.toFixed(2)}</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="font-semibold text-orange-900">Employer Taxes</div>
                <div className="text-2xl font-bold text-orange-700">${totalEmployerTax.toFixed(2)}</div>
              </div>
            </div>

            {/* Individual Employee Status */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <h4 className="font-medium text-sm text-muted-foreground">Individual Employee Status:</h4>
              {taxStatus.map((calc) => (
                <div key={calc.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                  <span className="font-medium">Employee {calc.employee_id.slice(-8)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      ${(calc.total_employee_taxes + calc.total_employer_taxes).toFixed(2)}
                    </span>
                    {getStatusBadge(calc.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {(!taxStatus || taxStatus.length === 0) && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tax calculations have been processed yet.</p>
            <p className="text-sm">Use the buttons above to preview or calculate taxes.</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 animate-spin" />
            <p>Loading tax calculation status...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
