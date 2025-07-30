import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Banknote, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter
} from "lucide-react";
import { halobillAPI } from "../../../domains/billing/halobill/api";
import type { Payment, Invoice } from "../../../domains/billing/halobill/types";

export const PaymentProcessor: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter, methodFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, invoicesData] = await Promise.all([
        halobillAPI.getPayments(),
        halobillAPI.getInvoices({ status: 'sent' }) // Only sent invoices can receive payments
      ]);
      setPayments(paymentsData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Failed to load payment data:', error);
      toast({
        title: "Error",
        description: "Failed to load payment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.processor_payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Method filter
    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.payment_method === methodFilter);
    }

    setFilteredPayments(filtered);
  };

  const processPayment = async (invoiceId: string, amount: number, method: string) => {
    try {
      // Find the invoice
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Create payment record
      const payment = await halobillAPI.createPayment({
        invoice_id: invoiceId,
        client_id: invoice.client_id,
        payment_method: method as any,
        processor: method === 'ach' ? 'modern_treasury' : 'stripe',
        amount: amount,
        status: 'processing'
      });

      // Simulate payment processing
      setTimeout(async () => {
        try {
          // Update payment status to completed
          const updatedPayment = { ...payment, status: 'completed' as const, processed_at: new Date().toISOString() };
          setPayments(payments => payments.map(p => p.id === payment.id ? updatedPayment : p));

          // Update invoice status to paid
          await halobillAPI.updateInvoiceStatus(invoiceId, 'paid');

          toast({
            title: "Payment Processed",
            description: `Payment of $${amount.toLocaleString()} has been processed successfully`,
          });
        } catch (error) {
          // Payment failed
          const failedPayment = { ...payment, status: 'failed' as const, failure_reason: 'Processing error' };
          setPayments(payments => payments.map(p => p.id === payment.id ? failedPayment : p));

          toast({
            title: "Payment Failed",
            description: "Payment processing failed",
            variant: "destructive",
          });
        }
      }, 2000);

      setPayments(payments => [payment, ...payments]);

      toast({
        title: "Payment Initiated",
        description: "Payment is being processed...",
      });
    } catch (error) {
      console.error('Failed to process payment:', error);
      toast({
        title: "Error",
        description: "Failed to initiate payment",
        variant: "destructive",
      });
    }
  };

  const refundPayment = async (paymentId: string, amount: number) => {
    try {
      // Simulate refund processing
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      const updatedPayment = { 
        ...payment, 
        status: 'refunded' as const, 
        refunded_at: new Date().toISOString(),
        refund_amount: amount
      };

      setPayments(payments => payments.map(p => p.id === paymentId ? updatedPayment : p));

      toast({
        title: "Refund Processed",
        description: `Refund of $${amount.toLocaleString()} has been processed`,
      });
    } catch (error) {
      console.error('Failed to process refund:', error);
      toast({
        title: "Error",
        description: "Failed to process refund",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-warning animate-spin" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'processing':
        return 'secondary';
      case 'refunded':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'ach':
        return <Banknote className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const calculateTotals = () => {
    const totals = filteredPayments.reduce((acc, payment) => {
      acc.total += payment.amount;
      if (payment.status === 'completed') {
        acc.completed += payment.amount;
      } else if (payment.status === 'processing') {
        acc.processing += payment.amount;
      } else if (payment.status === 'failed') {
        acc.failed += payment.amount;
      }
      return acc;
    }, { total: 0, completed: 0, processing: 0, failed: 0 });

    return totals;
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment Processor</h2>
          <p className="text-muted-foreground">
            Process payments and manage transactions
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.total.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${totals.completed.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <RefreshCw className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">${totals.processing.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${totals.failed.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Process New Payment */}
      <Card>
        <CardHeader>
          <CardTitle>Process New Payment</CardTitle>
          <CardDescription>
            Process payment for pending invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="invoice">Invoice</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select invoice" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.map((invoice) => (
                    <SelectItem key={invoice.id} value={invoice.id}>
                      {invoice.invoice_number} - ${invoice.total_amount.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="method">Payment Method</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ach">ACH Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="wire">Wire Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full">
                Process Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Payment ID..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="method">Method</Label>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="ach">ACH</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="wire">Wire</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setMethodFilter('all');
              }}>
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Payment List */}
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(payment.status)}
                    {getMethodIcon(payment.payment_method)}
                    <div>
                      <h3 className="font-medium">
                        Payment {payment.processor_payment_id || payment.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {payment.processor} • {payment.payment_method.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                    <div className="text-right">
                      <p className="font-medium">${payment.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {payment.failure_reason && (
                  <div className="mb-2">
                    <Badge variant="destructive" className="text-xs">
                      {payment.failure_reason}
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {payment.processed_at && (
                      <p>Processed: {new Date(payment.processed_at).toLocaleString()}</p>
                    )}
                    {payment.refunded_at && (
                      <p>Refunded: {new Date(payment.refunded_at).toLocaleString()}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {payment.status === 'completed' && !payment.refunded_at && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => refundPayment(payment.id, payment.amount)}
                      >
                        Refund
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredPayments.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No payments found matching your criteria
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};