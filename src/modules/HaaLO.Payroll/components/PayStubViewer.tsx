/**
 * Pay Stub Viewer Component
 * Modal for viewing and downloading pay stubs
 */

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Mail, 
  Printer, 
  X,
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';

interface PayStubViewerProps {
  payStubId: string;
  onClose: () => void;
}

const PayStubViewer: React.FC<PayStubViewerProps> = ({
  payStubId,
  onClose
}) => {
  // Mock pay stub data - would come from API
  const mockPayStub = {
    id: payStubId,
    stub_number: 'PS-2024-001',
    employee_name: 'John Doe',
    employee_id: 'EMP-001',
    pay_date: '2024-01-15',
    period_start: '2024-01-01',
    period_end: '2024-01-15',
    gross_pay: 2520.00,
    net_pay: 1764.00,
    total_deductions: 756.00,
    earnings: [
      { type: 'Regular Hours', hours: 80, rate: 30.00, amount: 2400.00 },
      { type: 'Overtime', hours: 4, rate: 45.00, amount: 120.00 }
    ],
    deductions: [
      { type: 'Federal Tax', amount: 378.00 },
      { type: 'State Tax', amount: 126.00 },
      { type: 'FICA', amount: 156.24 },
      { type: 'Medicare', amount: 36.54 },
      { type: 'Health Insurance', amount: 59.22 }
    ],
    ytd_totals: {
      gross: 2520.00,
      net: 1764.00,
      federal_tax: 378.00,
      state_tax: 126.00
    }
  };

  const handleDownloadPDF = () => {
    // Mock PDF download
    console.log('Downloading PDF for pay stub:', payStubId);
  };

  const handleEmailPayStub = () => {
    // Mock email functionality
    console.log('Emailing pay stub:', payStubId);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Pay Stub Viewer
              </DialogTitle>
              <DialogDescription>
                Pay stub for {mockPayStub.employee_name} - {mockPayStub.stub_number}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleEmailPayStub}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <DialogClose asChild>
                <Button variant="outline" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pay Stub Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pay Statement</CardTitle>
                  <div className="text-sm text-muted-foreground mt-1">
                    Employee: {mockPayStub.employee_name} ({mockPayStub.employee_id})
                  </div>
                </div>
                <Badge variant="outline">
                  {mockPayStub.stub_number}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground">Pay Date</div>
                  <div className="font-medium">
                    {new Date(mockPayStub.pay_date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Pay Period</div>
                  <div className="font-medium">
                    {new Date(mockPayStub.period_start).toLocaleDateString()} - {' '}
                    {new Date(mockPayStub.period_end).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Pay Method</div>
                  <div className="font-medium">Direct Deposit</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Earnings and Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockPayStub.earnings.map((earning, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{earning.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {earning.hours}h @ ${earning.rate}/hr
                        </div>
                      </div>
                      <div className="font-medium">
                        ${earning.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total Gross Pay</span>
                    <span>${mockPayStub.gross_pay.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deductions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockPayStub.deductions.map((deduction, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="font-medium">{deduction.type}</div>
                      <div className="font-medium">
                        ${deduction.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total Deductions</span>
                    <span>${mockPayStub.total_deductions.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Net Pay Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Net Pay</div>
                <div className="text-3xl font-bold text-green-600">
                  ${mockPayStub.net_pay.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Year-to-Date Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Year-to-Date Totals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Gross Pay</div>
                  <div className="font-medium">${mockPayStub.ytd_totals.gross.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Net Pay</div>
                  <div className="font-medium">${mockPayStub.ytd_totals.net.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Federal Tax</div>
                  <div className="font-medium">${mockPayStub.ytd_totals.federal_tax.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">State Tax</div>
                  <div className="font-medium">${mockPayStub.ytd_totals.state_tax.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayStubViewer;