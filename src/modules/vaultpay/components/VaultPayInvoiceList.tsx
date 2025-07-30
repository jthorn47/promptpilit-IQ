import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Filter, Eye, Download, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Invoice {
  id: string;
  invoice_number: string;
  company_name: string;
  invoice_date: string;
  due_date: string;
  status: string;
  total_amount: number;
  paid_amount: number;
  category: string | null;
  invoice_pdf_url: string | null;
}

export const VaultPayInvoiceList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Mock invoice data - will be replaced with real Supabase queries
  const mockInvoices: Invoice[] = [
    {
      id: "1",
      invoice_number: "VP-0001",
      company_name: "Acme Corporation",
      invoice_date: "2024-01-15",
      due_date: "2024-02-15",
      status: "paid",
      total_amount: 2500.00,
      paid_amount: 2500.00,
      category: "payroll",
      invoice_pdf_url: null
    },
    {
      id: "2",
      invoice_number: "VP-0002", 
      company_name: "TechStart LLC",
      invoice_date: "2024-02-15",
      due_date: "2024-03-15",
      status: "sent",
      total_amount: 1800.00,
      paid_amount: 0,
      category: "lms",
      invoice_pdf_url: null
    },
    {
      id: "3",
      invoice_number: "VP-0003",
      company_name: "Global Industries",
      invoice_date: "2024-03-15", 
      due_date: "2024-04-15",
      status: "overdue",
      total_amount: 3200.00,
      paid_amount: 1600.00,
      category: "benefits",
      invoice_pdf_url: null
    },
    {
      id: "4",
      invoice_number: "VP-0004",
      company_name: "Innovate Solutions",
      invoice_date: "2024-04-15",
      due_date: "2024-05-15", 
      status: "draft",
      total_amount: 1200.00,
      paid_amount: 0,
      category: "setup",
      invoice_pdf_url: null
    },
    {
      id: "5",
      invoice_number: "VP-0005",
      company_name: "TechStart LLC",
      invoice_date: "2024-05-15",
      due_date: "2024-06-15",
      status: "partial",
      total_amount: 2800.00,
      paid_amount: 950.00,
      category: "consulting",
      invoice_pdf_url: null
    }
  ];

  const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "paid", label: "Paid" },
    { value: "partial", label: "Partial" },
    { value: "overdue", label: "Overdue" }
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "payroll", label: "Payroll" },
    { value: "setup", label: "Setup" },
    { value: "lms", label: "LMS" },
    { value: "benefits", label: "Benefits" },
    { value: "consulting", label: "Consulting" }
  ];

  // Filter invoices based on search and filters
  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = searchTerm === "" || 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || invoice.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

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

  const getRemainingBalance = (invoice: Invoice) => {
    return invoice.total_amount - invoice.paid_amount;
  };

  const handleViewInvoice = (invoiceId: string) => {
    toast.info(`Viewing invoice ${invoiceId}...`);
  };

  const handleDownloadInvoice = (invoiceId: string, invoiceNumber: string) => {
    toast.info(`Downloading invoice ${invoiceNumber}...`);
  };

  const handleEditInvoice = (invoiceId: string) => {
    toast.info(`Editing invoice ${invoiceId}...`);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    toast.info(`Deleting invoice ${invoiceId}...`);
  };

  const getInvoiceStats = () => {
    const total = filteredInvoices.length;
    const paid = filteredInvoices.filter(inv => inv.status === 'paid').length;
    const overdue = filteredInvoices.filter(inv => inv.status === 'overdue').length;
    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const paidAmount = filteredInvoices.reduce((sum, inv) => sum + inv.paid_amount, 0);
    
    return { total, paid, overdue, totalAmount, paidAmount };
  };

  const stats = getInvoiceStats();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Invoices</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-success">{stats.paid}</div>
              <div className="text-sm text-muted-foreground">Paid Invoices</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
              <div className="text-sm text-muted-foreground">Overdue Invoices</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount - stats.paidAmount)}</div>
              <div className="text-sm text-muted-foreground">Outstanding</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                All Invoices
              </CardTitle>
              <CardDescription>
                Manage and track all invoices
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices or companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invoices found matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>{invoice.company_name}</TableCell>
                      <TableCell>
                        {format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.category ? 
                          categories.find(c => c.value === invoice.category)?.label || invoice.category
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(invoice.total_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.paid_amount)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(getRemainingBalance(invoice))}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewInvoice(invoice.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadInvoice(invoice.id, invoice.invoice_number)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditInvoice(invoice.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};