// Employee Paystubs Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Download, Eye, Search, DollarSign, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Paystub {
  id: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  grossPay: number;
  netPay: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  deductions: number;
  status: 'processed' | 'pending' | 'cancelled';
}

export const EmployeePaystubs: React.FC = () => {
  const [paystubs, setPaystubs] = useState<Paystub[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Mock data - replace with real API call
  useEffect(() => {
    const mockPaystubs: Paystub[] = [
      {
        id: '1',
        payPeriodStart: '2024-01-01',
        payPeriodEnd: '2024-01-15',
        payDate: '2024-01-18',
        grossPay: 2500.00,
        netPay: 1875.50,
        federalTax: 375.00,
        stateTax: 125.00,
        socialSecurity: 155.00,
        medicare: 36.25,
        deductions: 33.25,
        status: 'processed'
      },
      {
        id: '2',
        payPeriodStart: '2023-12-16',
        payPeriodEnd: '2023-12-31',
        payDate: '2024-01-03',
        grossPay: 2500.00,
        netPay: 1875.50,
        federalTax: 375.00,
        stateTax: 125.00,
        socialSecurity: 155.00,
        medicare: 36.25,
        deductions: 33.25,
        status: 'processed'
      },
      {
        id: '3',
        payPeriodStart: '2023-12-01',
        payPeriodEnd: '2023-12-15',
        payDate: '2023-12-18',
        grossPay: 2600.00,
        netPay: 1950.75,
        federalTax: 390.00,
        stateTax: 130.00,
        socialSecurity: 161.20,
        medicare: 37.70,
        deductions: 30.35,
        status: 'processed'
      }
    ];

    setTimeout(() => {
      setPaystubs(mockPaystubs);
      setLoading(false);
    }, 1000);
  }, []);

  const handleDownloadPaystub = (paystub: Paystub) => {
    toast({
      title: "Download Started",
      description: `Downloading paystub for ${paystub.payPeriodStart} - ${paystub.payPeriodEnd}`
    });
    // Implement actual download functionality
  };

  const handleViewPaystub = (paystub: Paystub) => {
    toast({
      title: "Opening Paystub",
      description: `Viewing details for ${paystub.payPeriodStart} - ${paystub.payPeriodEnd}`
    });
    // Implement view functionality
  };

  const filteredPaystubs = paystubs.filter(paystub =>
    paystub.payPeriodStart.includes(searchTerm) ||
    paystub.payPeriodEnd.includes(searchTerm) ||
    paystub.payDate.includes(searchTerm)
  );

  const currentYearTotal = paystubs
    .filter(p => new Date(p.payDate).getFullYear() === 2024)
    .reduce((sum, p) => ({
      gross: sum.gross + p.grossPay,
      net: sum.net + p.netPay,
      taxes: sum.taxes + p.federalTax + p.stateTax + p.socialSecurity + p.medicare
    }), { gross: 0, net: 0, taxes: 0 });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Paystubs</h1>
          <p className="text-muted-foreground">
            View and download your pay history and tax documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Year-End Summary
          </Button>
        </div>
      </div>

      {/* Year-to-Date Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Gross Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentYearTotal.gross.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Before deductions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Net Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentYearTotal.net.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">After deductions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Taxes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentYearTotal.taxes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total withheld</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Pay History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
              <Input
                placeholder="Search by date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Paystubs Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPaystubs.map((paystub) => (
                  <TableRow key={paystub.id}>
                    <TableCell>
                      <div className="font-medium">
                        {new Date(paystub.payPeriodStart).toLocaleDateString()} - {new Date(paystub.payPeriodEnd).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(paystub.payDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${paystub.grossPay.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      ${(paystub.federalTax + paystub.stateTax + paystub.socialSecurity + paystub.medicare + paystub.deductions).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${paystub.netPay.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={paystub.status === 'processed' ? 'default' : paystub.status === 'pending' ? 'secondary' : 'destructive'}>
                        {paystub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPaystub(paystub)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPaystub(paystub)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPaystubs.length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No paystubs found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};