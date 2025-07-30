import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { useEmployeePayStubs, useDownloadPayStub, useViewPayStub } from '../hooks/usePayStubs';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const EmployeePayStubPortal = () => {
  // TODO: Get actual employee ID from auth context
  const employeeId = 'current-employee-id';
  
  const { data: payStubs, isLoading } = useEmployeePayStubs(employeeId);
  const downloadPayStub = useDownloadPayStub();
  const viewPayStub = useViewPayStub();

  const handleViewStub = (stubId: string) => {
    viewPayStub.mutate(stubId);
  };

  const currentYearStubs = payStubs?.filter(
    stub => new Date(stub.pay_date).getFullYear() === new Date().getFullYear()
  ) || [];

  const ytdTotals = currentYearStubs.reduce(
    (acc, stub) => ({
      gross: acc.gross + stub.gross_pay,
      net: acc.net + stub.net_pay,
      taxes: acc.taxes + stub.total_taxes,
    }),
    { gross: 0, net: 0, taxes: 0 }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-blue-100 text-blue-800';
      case 'pdf_ready': return 'bg-green-100 text-green-800';
      case 'emailed': return 'bg-purple-100 text-purple-800';
      case 'viewed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">My Pay Stubs</h1>
        <p className="text-muted-foreground">
          View and download your pay stubs and earnings history
        </p>
      </div>

      {/* YTD Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Gross Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${ytdTotals.gross.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentYearStubs.length} pay periods
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Net Pay</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${ytdTotals.net.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              After taxes & deductions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Taxes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${ytdTotals.taxes.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total withholdings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pay Stubs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Pay Stubs
          </CardTitle>
          <CardDescription>
            Your pay stub history sorted by most recent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : payStubs?.length === 0 ? (
            <div className="text-center p-8 space-y-4">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-medium">No Pay Stubs Available</h3>
                <p className="text-muted-foreground">
                  Your pay stubs will appear here once payroll is processed
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {payStubs?.map((stub) => (
                <Card key={stub.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h3 className="font-semibold">
                            Pay Period: {format(new Date(stub.pay_period_start), 'MMM d')} - {format(new Date(stub.pay_period_end), 'MMM d, yyyy')}
                          </h3>
                          <Badge className={getStatusColor(stub.status)}>
                            {stub.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Pay Date: {format(new Date(stub.pay_date), 'MMM d, yyyy')}
                          </div>
                          <div className="font-mono">
                            #{stub.stub_number}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div>
                            <span className="text-sm text-muted-foreground">Gross Pay: </span>
                            <span className="font-semibold text-green-600">
                              ${stub.gross_pay.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Net Pay: </span>
                            <span className="font-semibold text-blue-600">
                              ${stub.net_pay.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Taxes: </span>
                            <span className="font-semibold text-orange-600">
                              ${stub.total_taxes.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link to={`/employee/paystubs/${stub.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewStub(stub.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          onClick={() => downloadPayStub.mutate(stub.id)}
                          disabled={downloadPayStub.isPending}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            If you have questions about your pay stub or need assistance:
          </p>
          <div className="space-y-2 text-sm">
            <div>• Contact HR at hr@company.com</div>
            <div>• Call the payroll helpline: (555) 123-4567</div>
            <div>• Visit the Employee Self-Service portal</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeePayStubPortal;