import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Building, 
  User,
  Calendar,
  DollarSign,
  Receipt,
  CreditCard
} from 'lucide-react';
import { usePayStub, useDownloadPayStub, useViewPayStub, usePayStubAccessLogs } from '../hooks/usePayStubs';
import { format } from 'date-fns';

const PayStubViewer = () => {
  const { stubId } = useParams<{ stubId: string }>();
  const { data: payStub, isLoading } = usePayStub(stubId!);
  const { data: accessLogs } = usePayStubAccessLogs(stubId!);
  const downloadPayStub = useDownloadPayStub();
  const viewPayStub = useViewPayStub();

  // Log the view when component mounts
  useEffect(() => {
    if (stubId) {
      viewPayStub.mutate(stubId);
    }
  }, [stubId]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!payStub) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center p-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Pay Stub Not Found</h2>
            <p className="text-muted-foreground">
              The requested pay stub could not be found or you don't have permission to view it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-blue-100 text-blue-800';
      case 'pdf_ready': return 'bg-green-100 text-green-800';
      case 'emailed': return 'bg-purple-100 text-purple-800';
      case 'viewed': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/payroll/paystubs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Pay Stub #{payStub.stub_number}</h1>
            <p className="text-muted-foreground">
              {Array.isArray(payStub.employees) ? payStub.employees[0]?.instructor_name : 'Employee'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(payStub.status)}>
            {payStub.status.replace('_', ' ')}
          </Badge>
          <Button
            onClick={() => downloadPayStub.mutate(payStub.id)}
            disabled={downloadPayStub.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Pay Stub Content */}
      <div className="bg-white border rounded-lg shadow-sm p-8 space-y-8">
        {/* Company and Employee Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-semibold">Your Company Name</span>
              </div>
              <div className="text-sm text-muted-foreground">
                123 Business Street<br />
                City, State 12345<br />
                (555) 123-4567
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-semibold">{Array.isArray(payStub.employees) ? payStub.employees[0]?.instructor_name : 'Employee Name'}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Employee ID: {payStub.employee_id.slice(0, 8)}
              </div>
              <div className="text-sm text-muted-foreground">
                {Array.isArray(payStub.employees) ? payStub.employees[0]?.email : 'No email'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pay Period Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Pay Period Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Pay Period</span>
                <div className="font-semibold">
                  {format(new Date(payStub.pay_period_start), 'MMM d')} - {format(new Date(payStub.pay_period_end), 'MMM d, yyyy')}
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Pay Date</span>
                <div className="font-semibold">
                  {format(new Date(payStub.pay_date), 'MMM d, yyyy')}
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Pay Stub Number</span>
                <div className="font-mono font-semibold">
                  {payStub.stub_number}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5" />
              Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {payStub.earnings_breakdown?.map((earning, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <span className="font-medium">{earning.description}</span>
                    {earning.hours && earning.rate && (
                      <span className="text-sm text-muted-foreground ml-2">
                        ({earning.hours} hrs × ${earning.rate})
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${earning.amount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      YTD: ${earning.ytd_amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center text-muted-foreground py-4">
                  No earnings data available
                </div>
              )}
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Gross Pay</span>
                <div className="text-right">
                  <div>${payStub.gross_pay.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    YTD: ${payStub.ytd_gross_pay.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deductions & Taxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deductions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt className="h-5 w-5" />
                Deductions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {payStub.deductions_breakdown?.map((deduction, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <span className="font-medium">{deduction.description}</span>
                      {deduction.is_pre_tax && (
                        <Badge variant="secondary" className="ml-2 text-xs">Pre-tax</Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">-${deduction.amount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        YTD: -${deduction.ytd_amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-muted-foreground py-4">
                    No deductions
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Taxes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Taxes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {payStub.taxes_breakdown?.map((tax, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <span className="font-medium">{tax.description}</span>
                      {tax.rate && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({(tax.rate * 100).toFixed(2)}%)
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">-${tax.amount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        YTD: -${tax.ytd_amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-muted-foreground py-4">
                    No tax data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Net Pay Summary */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-green-800">Net Pay</h3>
                <p className="text-sm text-green-600">Amount after deductions and taxes</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-800">
                  ${payStub.net_pay.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">
                  YTD: ${payStub.ytd_net_pay.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Direct Deposit */}
        {payStub.direct_deposit_breakdown && payStub.direct_deposit_breakdown.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5" />
                Direct Deposit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {payStub.direct_deposit_breakdown.map((deposit, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <span className="font-medium">
                        {deposit.account_type.charAt(0).toUpperCase() + deposit.account_type.slice(1)} Account
                      </span>
                      <div className="text-sm text-muted-foreground">
                        ****{deposit.account_last_four}
                        {deposit.bank_name && ` - ${deposit.bank_name}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${deposit.amount.toLocaleString()}</div>
                      {deposit.percentage && (
                        <div className="text-sm text-muted-foreground">
                          {deposit.percentage}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground border-t pt-4">
          <p>This is an official pay statement. Please retain for your records.</p>
          <p>Generated on {format(new Date(payStub.created_at), 'MMM d, yyyy \'at\' h:mm a')}</p>
        </div>
      </div>
    </div>
  );
};

export default PayStubViewer;