import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  DollarSign, 
  User, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  FileText,
  Download,
  Eye
} from 'lucide-react';

interface AdjustmentPreviewItem {
  employeeId: string;
  employeeName: string;
  department: string;
  currentYTD: number;
  adjustmentAmount: number;
  adjustmentType: string;
  grossPayAdjustment: number;
  federalTaxAdjustment: number;
  stateTaxAdjustment: number;
  ficaAdjustment: number;
  medicareAdjustment: number;
  netPayAdjustment: number;
  newYTDTotal: number;
  taxWithholdingRate: number;
}

const mockPreviewData: AdjustmentPreviewItem[] = [
  {
    employeeId: 'EMP-001',
    employeeName: 'John Doe',
    department: 'Engineering',
    currentYTD: 45000,
    adjustmentAmount: 2500,
    adjustmentType: 'Performance Bonus',
    grossPayAdjustment: 2500,
    federalTaxAdjustment: -550,
    stateTaxAdjustment: -175,
    ficaAdjustment: -155,
    medicareAdjustment: -36.25,
    netPayAdjustment: 1583.75,
    newYTDTotal: 47500,
    taxWithholdingRate: 36.65
  },
  {
    employeeId: 'EMP-002',
    employeeName: 'Jane Smith',
    department: 'Sales',
    currentYTD: 38000,
    adjustmentAmount: 1800,
    adjustmentType: 'Missed Overtime',
    grossPayAdjustment: 1800,
    federalTaxAdjustment: -324,
    stateTaxAdjustment: -126,
    ficaAdjustment: -111.6,
    medicareAdjustment: -26.1,
    netPayAdjustment: 1212.3,
    newYTDTotal: 39800,
    taxWithholdingRate: 32.65
  },
  {
    employeeId: 'EMP-003',
    employeeName: 'Bob Johnson',
    department: 'Marketing',
    currentYTD: 42000,
    adjustmentAmount: 3200,
    adjustmentType: 'Commission Correction',
    grossPayAdjustment: 3200,
    federalTaxAdjustment: -768,
    stateTaxAdjustment: -224,
    ficaAdjustment: -198.4,
    medicareAdjustment: -46.4,
    netPayAdjustment: 1963.2,
    newYTDTotal: 45200,
    taxWithholdingRate: 38.65
  }
];

export const AdjustmentPreview: React.FC = () => {
  const [previewData] = useState<AdjustmentPreviewItem[]>(mockPreviewData);
  const [selectedEmployee, setSelectedEmployee] = useState<AdjustmentPreviewItem | null>(null);
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);

  const calculateTotals = () => {
    return previewData.reduce((totals, item) => ({
      totalGrossAdjustment: totals.totalGrossAdjustment + item.grossPayAdjustment,
      totalFederalTax: totals.totalFederalTax + item.federalTaxAdjustment,
      totalStateTax: totals.totalStateTax + item.stateTaxAdjustment,
      totalFica: totals.totalFica + item.ficaAdjustment,
      totalMedicare: totals.totalMedicare + item.medicareAdjustment,
      totalNetPay: totals.totalNetPay + item.netPayAdjustment,
      totalEmployees: previewData.length
    }), {
      totalGrossAdjustment: 0,
      totalFederalTax: 0,
      totalStateTax: 0,
      totalFica: 0,
      totalMedicare: 0,
      totalNetPay: 0,
      totalEmployees: 0
    });
  };

  const totals = calculateTotals();

  const getTaxImpactColor = (amount: number) => {
    return amount < 0 ? 'text-red-600' : 'text-green-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getAdjustmentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'performance bonus':
      case 'bonus':
        return 'bg-green-100 text-green-800';
      case 'missed overtime':
      case 'overtime':
        return 'bg-orange-100 text-orange-800';
      case 'commission correction':
      case 'correction':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tax Recalculation Preview</h2>
          <p className="text-muted-foreground">
            Review tax implications before processing off-cycle adjustments
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowTaxBreakdown(!showTaxBreakdown)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {showTaxBreakdown ? 'Hide' : 'Show'} Tax Breakdown
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Preview
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Gross Adjustment</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totals.totalGrossAdjustment)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tax Withholding</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(Math.abs(totals.totalFederalTax + totals.totalStateTax + totals.totalFica + totals.totalMedicare))}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Net Pay</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totals.totalNetPay)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Employees Affected</p>
                <p className="text-2xl font-bold">{totals.totalEmployees}</p>
              </div>
              <User className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Breakdown Card */}
      {showTaxBreakdown && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Tax Withholding Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Federal Tax</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(Math.abs(totals.totalFederalTax))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">State Tax</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(Math.abs(totals.totalStateTax))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">FICA</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(Math.abs(totals.totalFica))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Medicare</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(Math.abs(totals.totalMedicare))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee Preview List */}
      <Card>
        <CardHeader>
          <CardTitle>Employee-by-Employee Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {previewData.map((employee) => (
              <div key={employee.employeeId} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="font-semibold">{employee.employeeName}</h4>
                      <Badge variant="outline">{employee.employeeId}</Badge>
                      <Badge className={getAdjustmentTypeColor(employee.adjustmentType)}>
                        {employee.adjustmentType}
                      </Badge>
                      <Badge variant="secondary">{employee.department}</Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                      <div>
                        <p className="text-xs text-muted-foreground">Current YTD</p>
                        <p className="font-medium">{formatCurrency(employee.currentYTD)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Gross Adjustment</p>
                        <p className="font-medium text-green-600">
                          +{formatCurrency(employee.grossPayAdjustment)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tax Withholding</p>
                        <p className={`font-medium ${getTaxImpactColor(employee.federalTaxAdjustment + employee.stateTaxAdjustment + employee.ficaAdjustment + employee.medicareAdjustment)}`}>
                          {formatCurrency(employee.federalTaxAdjustment + employee.stateTaxAdjustment + employee.ficaAdjustment + employee.medicareAdjustment)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Net Pay Impact</p>
                        <p className="font-medium text-blue-600">
                          +{formatCurrency(employee.netPayAdjustment)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">New YTD Total</p>
                        <p className="font-medium">{formatCurrency(employee.newYTDTotal)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tax Rate</p>
                        <p className="font-medium">{employee.taxWithholdingRate}%</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedEmployee(employee)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Validation Warnings */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-orange-900 mb-2">
                Pre-Processing Validation
              </h3>
              <div className="space-y-2 text-sm text-orange-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>All tax calculations verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>No duplicate payment conflicts detected</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Sufficient funds available for processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span>Review high earners for Social Security wage base limits</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <Card className="mt-6 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {selectedEmployee.employeeName} - Detailed Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Current Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Employee ID:</span>
                    <span>{selectedEmployee.employeeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Department:</span>
                    <span>{selectedEmployee.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current YTD:</span>
                    <span>{formatCurrency(selectedEmployee.currentYTD)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Adjustment Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span>{selectedEmployee.adjustmentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gross Amount:</span>
                    <span className="text-green-600">+{formatCurrency(selectedEmployee.grossPayAdjustment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Amount:</span>
                    <span className="text-blue-600">+{formatCurrency(selectedEmployee.netPayAdjustment)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">Tax Withholding Breakdown</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Federal Tax:</span>
                    <span className="text-red-600">{formatCurrency(selectedEmployee.federalTaxAdjustment)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>State Tax:</span>
                    <span className="text-red-600">{formatCurrency(selectedEmployee.stateTaxAdjustment)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>FICA:</span>
                    <span className="text-red-600">{formatCurrency(selectedEmployee.ficaAdjustment)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Medicare:</span>
                    <span className="text-red-600">{formatCurrency(selectedEmployee.medicareAdjustment)}</span>
                  </div>
                </div>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total Tax Withholding:</span>
                <span className="text-red-600">
                  {formatCurrency(selectedEmployee.federalTaxAdjustment + selectedEmployee.stateTaxAdjustment + selectedEmployee.ficaAdjustment + selectedEmployee.medicareAdjustment)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setSelectedEmployee(null)}>Close</Button>
              <Button variant="outline">Generate Pay Stub Preview</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};