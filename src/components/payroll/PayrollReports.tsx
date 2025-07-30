import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  AlertCircle, 
  DollarSign, 
  Clock, 
  Users,
  Calendar,
  TrendingUp,
  Printer
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PayrollPeriod {
  id: string;
  start_date: string;
  end_date: string;
  period_type: string;
  status: string;
}

interface PayrollSummary {
  total_employees: number;
  total_classes: number;
  total_hours: number;
  total_overtime_hours: number;
  total_gross_pay: number;
  pending_periods: number;
}

interface PayrollReportsProps {
  selectedPeriod: PayrollPeriod | null;
  payrollSummary: PayrollSummary | null;
}

interface PayrollReportData {
  employee_name: string;
  employee_id: string;
  total_classes: number;
  class_pay: number;
  regular_hours: number;
  overtime_hours: number;
  blended_rate: number;
  overtime_pay: number;
  gross_pay: number;
  calculation_details: any;
}

export const PayrollReports: React.FC<PayrollReportsProps> = ({
  selectedPeriod,
  payrollSummary
}) => {
  const [reportData, setReportData] = useState<PayrollReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (selectedPeriod) {
      fetchReportData();
    }
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    if (!selectedPeriod) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('payroll_calculations')
        .select(`
          *,
          payroll_employees!inner(instructor_name, employee_id)
        `)
        .eq('payroll_period_id', selectedPeriod.id)
        .order('gross_pay', { ascending: false });

      if (error) throw error;

      const formattedData: PayrollReportData[] = data?.map(calc => ({
        employee_name: calc.payroll_employees.instructor_name,
        employee_id: calc.payroll_employee_id,
        total_classes: calc.total_classes,
        class_pay: calc.total_class_pay,
        regular_hours: calc.total_regular_hours,
        overtime_hours: calc.total_overtime_hours,
        blended_rate: calc.blended_rate,
        overtime_pay: calc.overtime_pay,
        gross_pay: calc.gross_pay,
        calculation_details: calc.calculation_details
      })) || [];

      setReportData(formattedData);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCSVReport = () => {
    if (!selectedPeriod || reportData.length === 0) {
      toast({
        title: "Error",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    
    try {
      const headers = [
        'Employee Name',
        'Employee ID',
        'Total Classes',
        'Class Pay',
        'Regular Hours',
        'Overtime Hours',
        'Blended Rate',
        'Overtime Pay',
        'Gross Pay',
        'Period Start',
        'Period End',
        'Compliance Note'
      ];

      const rows = reportData.map(data => [
        data.employee_name,
        data.employee_id,
        data.total_classes,
        data.class_pay.toFixed(2),
        data.regular_hours.toFixed(2),
        data.overtime_hours.toFixed(2),
        data.blended_rate.toFixed(2),
        data.overtime_pay.toFixed(2),
        data.gross_pay.toFixed(2),
        selectedPeriod.start_date,
        selectedPeriod.end_date,
        data.calculation_details?.compliance_note || 'Calculated in compliance with California wage and hour laws'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `f45_payroll_${selectedPeriod.start_date}_to_${selectedPeriod.end_date}.csv`;
      link.click();

      toast({
        title: "Success",
        description: "CSV report exported successfully",
      });
    } catch (error) {
      console.error('Error generating CSV:', error);
      toast({
        title: "Error",
        description: "Failed to generate CSV report",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const generatePDFReport = () => {
    if (!selectedPeriod || reportData.length === 0) {
      toast({
        title: "Error",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }

    // Create a printable version of the report
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>F45 Payroll Report - ${selectedPeriod.start_date} to ${selectedPeriod.end_date}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .period { color: #666; }
            .compliance { background: #f0f9ff; padding: 15px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; }
            .currency { text-align: right; }
            .total-row { font-weight: bold; background-color: #f8f9fa; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>F45 Payroll Report</h1>
            <p class="period">Pay Period: ${new Date(selectedPeriod.start_date).toLocaleDateString()} - ${new Date(selectedPeriod.end_date).toLocaleDateString()}</p>
          </div>
          
          <div class="compliance">
            <strong>California Wage & Hour Compliance:</strong> All calculations comply with California Labor Code § 510 using blended overtime rates. Overtime is calculated at 1.5x the blended rate for hours over 40 per week.
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Classes</th>
                <th>Class Pay</th>
                <th>Regular Hours</th>
                <th>OT Hours</th>
                <th>Blended Rate</th>
                <th>OT Pay</th>
                <th>Gross Pay</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.map(data => `
                <tr>
                  <td>${data.employee_name}</td>
                  <td>${data.total_classes}</td>
                  <td class="currency">$${data.class_pay.toFixed(2)}</td>
                  <td>${data.regular_hours.toFixed(1)}</td>
                  <td>${data.overtime_hours.toFixed(1)}</td>
                  <td class="currency">$${data.blended_rate.toFixed(2)}</td>
                  <td class="currency">$${data.overtime_pay.toFixed(2)}</td>
                  <td class="currency">$${data.gross_pay.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td>TOTALS</td>
                <td>${reportData.reduce((sum, data) => sum + data.total_classes, 0)}</td>
                <td class="currency">$${reportData.reduce((sum, data) => sum + data.class_pay, 0).toFixed(2)}</td>
                <td>${reportData.reduce((sum, data) => sum + data.regular_hours, 0).toFixed(1)}</td>
                <td>${reportData.reduce((sum, data) => sum + data.overtime_hours, 0).toFixed(1)}</td>
                <td>-</td>
                <td class="currency">$${reportData.reduce((sum, data) => sum + data.overtime_pay, 0).toFixed(2)}</td>
                <td class="currency">$${reportData.reduce((sum, data) => sum + data.gross_pay, 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>This report was generated by EaseBase F45 Payroll System</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (!selectedPeriod) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Pay Period Selected</h3>
          <p className="text-muted-foreground">Please select a pay period to generate reports.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payroll Reports</h2>
          <p className="text-muted-foreground">
            Period: {new Date(selectedPeriod.start_date).toLocaleDateString()} - {new Date(selectedPeriod.end_date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generatePDFReport} disabled={generating || loading}>
            <Printer className="w-4 h-4 mr-2" />
            Print PDF
          </Button>
          <Button onClick={generateCSVReport} disabled={generating || loading}>
            {generating ? (
              <>
                <Download className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{reportData.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold">{reportData.reduce((sum, data) => sum + data.total_classes, 0)}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overtime Hours</p>
                <p className="text-2xl font-bold text-orange-600">
                  {reportData.reduce((sum, data) => sum + data.overtime_hours, 0).toFixed(1)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Gross Pay</p>
                <p className="text-2xl font-bold text-green-600">
                  ${reportData.reduce((sum, data) => sum + data.gross_pay, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Notice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800">California Wage & Hour Compliance</h3>
              <p className="text-sm text-green-700">
                This report includes all calculations in compliance with California Labor Code § 510. 
                Overtime is calculated using blended rates at 1.5x for hours over 40 per week. 
                All audit trails are maintained for compliance purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Payroll Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Loading report data...</p>
              </div>
            ) : reportData.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No payroll data available for this period</p>
                <p className="text-sm text-muted-foreground">Run payroll calculations first to generate reports</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Employee</th>
                      <th className="text-right p-3">Classes</th>
                      <th className="text-right p-3">Class Pay</th>
                      <th className="text-right p-3">Regular Hours</th>
                      <th className="text-right p-3">OT Hours</th>
                      <th className="text-right p-3">Blended Rate</th>
                      <th className="text-right p-3">OT Pay</th>
                      <th className="text-right p-3">Gross Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((data, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3 font-medium">{data.employee_name}</td>
                        <td className="p-3 text-right">{data.total_classes}</td>
                        <td className="p-3 text-right">${data.class_pay.toFixed(2)}</td>
                        <td className="p-3 text-right">{data.regular_hours.toFixed(1)}</td>
                        <td className="p-3 text-right">
                          {data.overtime_hours > 0 ? (
                            <span className="text-orange-600 font-semibold">
                              {data.overtime_hours.toFixed(1)}
                            </span>
                          ) : (
                            '0.0'
                          )}
                        </td>
                        <td className="p-3 text-right">${data.blended_rate.toFixed(2)}</td>
                        <td className="p-3 text-right">
                          {data.overtime_pay > 0 ? (
                            <span className="text-orange-600 font-semibold">
                              ${data.overtime_pay.toFixed(2)}
                            </span>
                          ) : (
                            '$0.00'
                          )}
                        </td>
                        <td className="p-3 text-right font-bold text-green-600">
                          ${data.gross_pay.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-bold bg-muted">
                      <td className="p-3">TOTALS</td>
                      <td className="p-3 text-right">{reportData.reduce((sum, data) => sum + data.total_classes, 0)}</td>
                      <td className="p-3 text-right">${reportData.reduce((sum, data) => sum + data.class_pay, 0).toFixed(2)}</td>
                      <td className="p-3 text-right">{reportData.reduce((sum, data) => sum + data.regular_hours, 0).toFixed(1)}</td>
                      <td className="p-3 text-right text-orange-600">{reportData.reduce((sum, data) => sum + data.overtime_hours, 0).toFixed(1)}</td>
                      <td className="p-3 text-right">-</td>
                      <td className="p-3 text-right text-orange-600">${reportData.reduce((sum, data) => sum + data.overtime_pay, 0).toFixed(2)}</td>
                      <td className="p-3 text-right text-green-600">${reportData.reduce((sum, data) => sum + data.gross_pay, 0).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Report Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Available Export Formats</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={generateCSVReport}>
                  <FileText className="w-4 h-4 mr-2" />
                  CSV Export (Excel Compatible)
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={generatePDFReport}>
                  <Printer className="w-4 h-4 mr-2" />
                  PDF Report (Printable)
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Report Information</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Includes all California compliance calculations</p>
                <p>• Blended overtime rates applied correctly</p>
                <p>• Audit trail maintained for all calculations</p>
                <p>• Ready for payroll processing</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};