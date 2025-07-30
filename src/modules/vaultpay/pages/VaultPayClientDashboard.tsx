import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, HelpCircle, FileText, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// Mock data structure until database is set up
interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: string;
  total_amount: number;
  category: string | null;
  invoice_pdf_url: string | null;
}

interface ARSummary {
  current: number;
  days_30: number;
  days_60: number;
  days_90_plus: number;
  total: number;
}

export const VaultPayClientDashboard = () => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Mock data - will be replaced with real Supabase queries
  const mockInvoices: Invoice[] = [
    {
      id: "1",
      invoice_number: "VP-0001",
      invoice_date: "2024-01-15",
      due_date: "2024-02-15",
      status: "paid",
      total_amount: 2500.00,
      category: "payroll",
      invoice_pdf_url: null
    },
    {
      id: "2", 
      invoice_number: "VP-0002",
      invoice_date: "2024-02-15",
      due_date: "2024-03-15",
      status: "sent",
      total_amount: 1800.00,
      category: "lms",
      invoice_pdf_url: null
    },
    {
      id: "3",
      invoice_number: "VP-0003", 
      invoice_date: "2024-03-15",
      due_date: "2024-04-15",
      status: "overdue",
      total_amount: 3200.00,
      category: "benefits",
      invoice_pdf_url: null
    }
  ];

  const mockARSummary: ARSummary = {
    current: 1800.00,
    days_30: 0,
    days_60: 1200.00,
    days_90_plus: 2000.00,
    total: 5000.00
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "payroll", label: "Payroll" },
    { value: "setup", label: "Setup" },
    { value: "lms", label: "LMS" },
    { value: "benefits", label: "Benefits" },
    { value: "consulting", label: "Consulting" }
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
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

  const handleDownloadInvoice = (invoiceId: string, invoiceNumber: string) => {
    toast.info(`Downloading invoice ${invoiceNumber}...`);
  };

  const handleRequestBillingHelp = () => {
    toast.info("Redirecting to billing support...");
  };

  // Filter invoices based on selected filters
  const filteredInvoices = mockInvoices.filter(invoice => {
    const invoiceYear = new Date(invoice.invoice_date).getFullYear().toString();
    const yearMatch = invoiceYear === selectedYear;
    const categoryMatch = selectedCategory === "all" || invoice.category === selectedCategory;
    return yearMatch && categoryMatch;
  });

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            My Invoices
          </h1>
          <p className="text-muted-foreground">
            View your invoices and payment history
          </p>
        </div>
        <Button onClick={handleRequestBillingHelp} variant="outline" className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          Request Billing Help
        </Button>
      </div>

      {/* A/R Summary Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Account Balance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center space-y-2">
              <div className="text-xl sm:text-2xl font-bold text-success">
                {formatCurrency(mockARSummary.current)}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Current<br />(0-30 days)</div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-xl sm:text-2xl font-bold text-warning">
                {formatCurrency(mockARSummary.days_30)}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">31-60 days</div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-xl sm:text-2xl font-bold text-orange-500">
                {formatCurrency(mockARSummary.days_60)}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">61-90 days</div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-xl sm:text-2xl font-bold text-destructive">
                {formatCurrency(mockARSummary.days_90_plus)}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">90+ days</div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {formatCurrency(mockARSummary.total)}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Total Balance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            {filteredInvoices.length} invoice(s) found for {selectedYear}
            {selectedCategory !== "all" && ` in ${categories.find(c => c.value === selectedCategory)?.label}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invoices found for the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
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
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadInvoice(invoice.id, invoice.invoice_number)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
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