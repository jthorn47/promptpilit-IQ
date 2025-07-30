import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Download,
  Eye,
  FileText,
  DollarSign,
  TrendingUp,
  Calendar,
  Search,
  Bell,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  useEmployeePayStubs, 
  useDownloadPayStub, 
  useViewPayStub 
} from '@/modules/HaaLO.PayStubGenerator/hooks/usePayStubs';
import type { PayStub } from '@/modules/HaaLO.PayStubGenerator/types';

const PayStubsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStub, setSelectedStub] = useState<PayStub | null>(null);

  // Get current user and employee info
  const { data: currentEmployee } = useQuery({
    queryKey: ['current-employee'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch employee pay stubs
  const { data: payStubs, isLoading, refetch } = useEmployeePayStubs(
    currentEmployee?.id || ''
  );

  const downloadPayStub = useDownloadPayStub();
  const viewPayStub = useViewPayStub();

  // Filter pay stubs based on search
  const filteredStubs = payStubs?.filter(stub => 
    format(new Date(stub.pay_period_start), 'MMM yyyy').toLowerCase().includes(searchTerm.toLowerCase()) ||
    format(new Date(stub.pay_period_end), 'MMM yyyy').toLowerCase().includes(searchTerm.toLowerCase()) ||
    format(new Date(stub.pay_date), 'MMM yyyy').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Calculate YTD totals
  const currentYear = new Date().getFullYear();
  const currentYearStubs = payStubs?.filter(stub => 
    new Date(stub.pay_date).getFullYear() === currentYear
  ) || [];

  const ytdTotals = currentYearStubs.reduce((acc, stub) => ({
    gross: acc.gross + stub.gross_pay,
    deductions: acc.deductions + stub.total_deductions,
    taxes: acc.taxes + stub.total_taxes,
    net: acc.net + stub.net_pay
  }), { gross: 0, deductions: 0, taxes: 0, net: 0 });

  const handleViewStub = async (stub: PayStub) => {
    try {
      await viewPayStub.mutateAsync(stub.id);
      setSelectedStub(stub);
    } catch (error) {
      console.error('Failed to log view:', error);
      // Still show the stub even if logging fails
      setSelectedStub(stub);
    }
  };

  const handleDownloadStub = async (stubId: string) => {
    try {
      await downloadPayStub.mutateAsync(stubId);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getStatusBadge = (stub: PayStub) => {
    const isViewed = stub.status === 'viewed';
    return (
      <Badge variant={isViewed ? 'default' : 'secondary'} className="flex items-center gap-1">
        {isViewed ? <CheckCircle className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
        {isViewed ? 'Viewed' : 'Available'}
      </Badge>
    );
  };

  if (!currentEmployee) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No Employee Profile Found</h3>
          <p className="text-muted-foreground">Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Pay Stubs</h1>
          <p className="text-muted-foreground">
            View and download your payment history
          </p>
        </div>
      </div>

      {/* YTD Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Gross Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${ytdTotals.gross.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {currentYear} year-to-date
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Taxes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${ytdTotals.taxes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total taxes withheld
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Deductions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${ytdTotals.deductions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Benefits & deductions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Net Pay</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${ytdTotals.net.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Take-home pay
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by pay period..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pay Stubs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pay Stubs</CardTitle>
          <CardDescription>
            {filteredStubs.length} pay stub{filteredStubs.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Check Date</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading pay stubs...
                    </TableCell>
                  </TableRow>
                ) : filteredStubs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {searchTerm ? 'No pay stubs match your search' : 'No pay stubs found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStubs.map((stub) => (
                    <TableRow key={stub.id}>
                      <TableCell>
                        <div className="font-medium">
                          {format(new Date(stub.pay_period_start), 'MMM dd')} - {format(new Date(stub.pay_period_end), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(stub.pay_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${stub.gross_pay.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${stub.net_pay.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(stub)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewStub(stub)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Pay Stub Details</DialogTitle>
                                <DialogDescription>
                                  Pay period: {format(new Date(stub.pay_period_start), 'MMM dd')} - {format(new Date(stub.pay_period_end), 'MMM dd, yyyy')}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedStub && (
                                <div className="space-y-6">
                                  {/* Employee & Company Info */}
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-sm">Employee Information</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        <div>
                                          <span className="text-sm font-medium">Name:</span>
                                          <span className="text-sm ml-2">{selectedStub.employee_name}</span>
                                        </div>
                                        <div>
                                          <span className="text-sm font-medium">Employee ID:</span>
                                          <span className="text-sm ml-2">{selectedStub.employee_id_number}</span>
                                        </div>
                                      </CardContent>
                                    </Card>
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-sm">Company Information</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        <div>
                                          <span className="text-sm font-medium">Company:</span>
                                          <span className="text-sm ml-2">{selectedStub.employer_legal_name}</span>
                                        </div>
                                        <div>
                                          <span className="text-sm font-medium">EIN:</span>
                                          <span className="text-sm ml-2">{selectedStub.employer_ein}</span>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>

                                  {/* Earnings */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm">Earnings</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Hours</TableHead>
                                            <TableHead>Rate</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>YTD</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {selectedStub.earnings_breakdown?.map((earning, index) => (
                                            <TableRow key={index}>
                                              <TableCell>{earning.description}</TableCell>
                                              <TableCell>{earning.hours || '-'}</TableCell>
                                              <TableCell>{earning.rate ? `$${earning.rate}` : '-'}</TableCell>
                                              <TableCell>${earning.amount.toLocaleString()}</TableCell>
                                              <TableCell>${earning.ytd_amount.toLocaleString()}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </CardContent>
                                  </Card>

                                  {/* Taxes & Deductions */}
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-sm">Taxes</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Tax</TableHead>
                                              <TableHead>Amount</TableHead>
                                              <TableHead>YTD</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {selectedStub.taxes_breakdown?.map((tax, index) => (
                                              <TableRow key={index}>
                                                <TableCell>{tax.description}</TableCell>
                                                <TableCell>${tax.amount.toLocaleString()}</TableCell>
                                                <TableCell>${tax.ytd_amount.toLocaleString()}</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </CardContent>
                                    </Card>

                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-sm">Deductions</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Deduction</TableHead>
                                              <TableHead>Amount</TableHead>
                                              <TableHead>YTD</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {selectedStub.deductions_breakdown?.map((deduction, index) => (
                                              <TableRow key={index}>
                                                <TableCell>{deduction.description}</TableCell>
                                                <TableCell>${deduction.amount.toLocaleString()}</TableCell>
                                                <TableCell>${deduction.ytd_amount.toLocaleString()}</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </CardContent>
                                    </Card>
                                  </div>

                                  {/* Totals */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm">Pay Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="grid gap-2 md:grid-cols-4">
                                        <div className="text-center">
                                          <div className="text-sm font-medium">Gross Pay</div>
                                          <div className="text-lg font-bold">${selectedStub.gross_pay.toLocaleString()}</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-sm font-medium">Taxes</div>
                                          <div className="text-lg">${selectedStub.total_taxes.toLocaleString()}</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-sm font-medium">Deductions</div>
                                          <div className="text-lg">${selectedStub.total_deductions.toLocaleString()}</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-sm font-medium">Net Pay</div>
                                          <div className="text-lg font-bold text-success">${selectedStub.net_pay.toLocaleString()}</div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadStub(stub.id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayStubsPage;