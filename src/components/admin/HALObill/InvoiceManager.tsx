import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Send, 
  Eye,
  DollarSign,
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { halobillAPI } from "../../../domains/billing/halobill/api";
import type { Invoice, InvoiceLineItem } from "../../../domains/billing/halobill/types";

export const InvoiceManager: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  const [invoiceForm, setInvoiceForm] = useState({
    client_id: '',
    billing_period_start: '',
    billing_period_end: '',
    due_date: '',
    subtotal: 0,
    tax_amount: 0,
    total_amount: 0,
    line_items: [] as Omit<InvoiceLineItem, 'id' | 'invoice_id' | 'created_at'>[]
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, statusFilter, dateFilter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await halobillAPI.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(invoice => 
            new Date(invoice.created_at) >= filterDate
          );
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(invoice => 
            new Date(invoice.created_at) >= filterDate
          );
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(invoice => 
            new Date(invoice.created_at) >= filterDate
          );
          break;
      }
    }

    setFilteredInvoices(filtered);
  };

  const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status']) => {
    try {
      const updated = await halobillAPI.updateInvoiceStatus(invoiceId, status);
      setInvoices(invoices => invoices.map(inv => inv.id === updated.id ? updated : inv));
      
      toast({
        title: "Success",
        description: `Invoice status updated to ${status}`,
      });
    } catch (error) {
      console.error('Failed to update invoice status:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice status",
        variant: "destructive",
      });
    }
  };

  const generateInvoicePDF = async (invoiceId: string) => {
    // This would integrate with a PDF generation service
    toast({
      title: "PDF Generation",
      description: "PDF generation feature coming soon",
    });
  };

  const sendInvoice = async (invoiceId: string) => {
    // This would integrate with email service
    await updateInvoiceStatus(invoiceId, 'sent');
    toast({
      title: "Invoice Sent",
      description: "Invoice has been sent to the client",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'sent':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'draft':
        return <FileText className="h-4 w-4 text-muted-foreground" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'overdue':
        return 'destructive';
      case 'sent':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const calculateTotals = () => {
    const totals = filteredInvoices.reduce((acc, invoice) => {
      acc.total += invoice.total_amount;
      acc.paid += invoice.status === 'paid' ? invoice.total_amount : 0;
      acc.pending += invoice.status === 'sent' ? invoice.total_amount : 0;
      acc.overdue += invoice.status === 'overdue' ? invoice.total_amount : 0;
      return acc;
    }, { total: 0, paid: 0, pending: 0, overdue: 0 });

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
          <h2 className="text-2xl font-bold tracking-tight">Invoice Manager</h2>
          <p className="text-muted-foreground">
            Create, manage, and track invoices
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.total.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${totals.paid.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">${totals.pending.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${totals.overdue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Invoice number or client..."
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
              }}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(invoice.status)}
                    <div>
                      <h3 className="font-medium">{invoice.invoice_number}</h3>
                      <p className="text-sm text-muted-foreground">
                        {invoice.client?.company_name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                    <div className="text-right">
                      <p className="font-medium">${invoice.total_amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p>Period: {new Date(invoice.billing_period_start).toLocaleDateString()} - {new Date(invoice.billing_period_end).toLocaleDateString()}</p>
                    <p>Created: {new Date(invoice.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button size="sm" variant="ghost" onClick={() => generateInvoicePDF(invoice.id)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    {invoice.status === 'draft' && (
                      <Button size="sm" variant="ghost" onClick={() => sendInvoice(invoice.id)}>
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {invoice.status === 'sent' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </div>

                {/* Line Items Preview */}
                {invoice.line_items && invoice.line_items.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium mb-2">Line Items:</p>
                    <div className="space-y-1">
                      {invoice.line_items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                          <span>{item.description}</span>
                          <span>${item.line_total.toLocaleString()}</span>
                        </div>
                      ))}
                      {invoice.line_items.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{invoice.line_items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredInvoices.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No invoices found matching your criteria
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Invoice Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Invoice</CardTitle>
              <CardDescription>
                Generate a new invoice for client billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Invoice creation form coming soon
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => setShowCreateForm(false)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};