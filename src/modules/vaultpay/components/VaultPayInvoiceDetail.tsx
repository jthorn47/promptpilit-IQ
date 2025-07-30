import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Edit, Mail, DollarSign, FileText, Calendar, Building } from "lucide-react";
import { format } from "date-fns";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Payment {
  id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  memo: string | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
  company_name: string;
  company_address: string | null;
  invoice_date: string;
  due_date: string;
  sent_date: string | null;
  status: string;
  total_amount: number;
  category: string | null;
  notes: string | null;
  invoice_pdf_url: string | null;
  line_items: LineItem[];
  payments: Payment[];
}

export const VaultPayInvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock invoice data - will be replaced with real Supabase query
  const mockInvoice: Invoice = {
    id: id || "1",
    invoice_number: "VP-0003",
    company_name: "Global Industries",
    company_address: "123 Business St, Suite 100\nAnytown, ST 12345",
    invoice_date: "2024-03-15",
    due_date: "2024-04-15",
    sent_date: "2024-03-16",
    status: "partial",
    total_amount: 3200.00,
    category: "benefits",
    notes: "Monthly benefits administration and compliance services",
    invoice_pdf_url: null,
    line_items: [
      {
        id: "1",
        description: "Benefits Administration - March 2024",
        quantity: 1,
        unit_price: 2000.00,
        total: 2000.00
      },
      {
        id: "2", 
        description: "COBRA Administration - 15 participants",
        quantity: 15,
        unit_price: 50.00,
        total: 750.00
      },
      {
        id: "3",
        description: "Benefits Compliance Review",
        quantity: 1,
        unit_price: 450.00,
        total: 450.00
      }
    ],
    payments: [
      {
        id: "1",
        payment_date: "2024-03-20",
        amount: 1600.00,
        payment_method: "ACH",
        memo: "Partial payment - 50% of invoice"
      }
    ]
  };

  useEffect(() => {
    // Simulate loading invoice data
    const loadInvoice = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual Supabase query
        await new Promise(resolve => setTimeout(resolve, 500)); // Mock API call
        setInvoice(mockInvoice);
      } catch (error) {
        console.error('Error loading invoice:', error);
        toast.error("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadInvoice();
    }
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-success text-success-foreground';
      case 'sent': return 'bg-primary text-primary-foreground';
      case 'partial': return 'bg-warning text-warning-foreground';
      case 'overdue': return 'bg-destructive text-destructive-foreground';
      case 'draft': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTotalPaid = () => {
    return invoice?.payments.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  };

  const getRemainingBalance = () => {
    return (invoice?.total_amount || 0) - getTotalPaid();
  };

  const handleDownloadPDF = () => {
    toast.info(`Downloading invoice ${invoice?.invoice_number}...`);
  };

  const handleEditInvoice = () => {
    toast.info(`Editing invoice ${invoice?.invoice_number}...`);
  };

  const handleSendInvoice = () => {
    toast.info(`Sending invoice ${invoice?.invoice_number}...`);
  };

  const handleRecordPayment = () => {
    toast.info(`Recording payment for invoice ${invoice?.invoice_number}...`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="text-center py-8 text-muted-foreground">
          Loading invoice...
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="text-center py-8 text-muted-foreground">
          Invoice not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Invoice {invoice.invoice_number}
            </h1>
            <p className="text-muted-foreground">
              {invoice.company_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(invoice.status)}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Invoice Details
              </CardTitle>
              <CardDescription>
                Invoice information and billing details
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleDownloadPDF} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={handleEditInvoice} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {invoice.status === 'draft' && (
                <Button onClick={handleSendInvoice} size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invoice
                </Button>
              )}
              {invoice.status !== 'paid' && (
                <Button onClick={handleRecordPayment} size="sm">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoice Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Bill To:</h3>
                <div className="text-sm">
                  <div className="font-medium">{invoice.company_name}</div>
                  {invoice.company_address && (
                    <div className="text-muted-foreground whitespace-pre-line">
                      {invoice.company_address}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Invoice Date:</span>
                  <div className="font-medium">
                    {format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Due Date:</span>
                  <div className="font-medium">
                    {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                  </div>
                </div>
                {invoice.sent_date && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Sent Date:</span>
                      <div className="font-medium">
                        {format(new Date(invoice.sent_date), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </>
                )}
                {invoice.category && (
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <div className="font-medium capitalize">{invoice.category}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {invoice.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Notes:</h3>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.line_items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.total)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell colSpan={3} className="text-right font-semibold">
                    Total Amount:
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {formatCurrency(invoice.total_amount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      {invoice.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Memo</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="capitalize">{payment.payment_method}</TableCell>
                        <TableCell>{payment.memo || '-'}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">Total Invoice</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(invoice.total_amount)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Paid</div>
                  <div className="text-lg font-semibold text-success">
                    {formatCurrency(getTotalPaid())}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Remaining Balance</div>
                  <div className="text-lg font-semibold text-destructive">
                    {formatCurrency(getRemainingBalance())}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};