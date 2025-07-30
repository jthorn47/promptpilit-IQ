import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, FileText, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { toast } from "sonner";

interface ARSummary {
  company_id: string;
  company_name: string;
  current_amount: number;
  days_30_amount: number;
  days_60_amount: number;
  days_90_plus_amount: number;
  total_amount: number;
}

interface VaultPayARReportProps {
  compact?: boolean;
}

export const VaultPayARReport = ({ compact = false }: VaultPayARReportProps) => {
  const [viewType, setViewType] = useState<"table" | "chart">("table");

  // Mock A/R data - will be replaced with real Supabase queries
  const mockARData: ARSummary[] = [
    {
      company_id: "1",
      company_name: "Acme Corporation",
      current_amount: 2500.00,
      days_30_amount: 0,
      days_60_amount: 1200.00,
      days_90_plus_amount: 0,
      total_amount: 3700.00
    },
    {
      company_id: "2", 
      company_name: "TechStart LLC",
      current_amount: 1800.00,
      days_30_amount: 950.00,
      days_60_amount: 0,
      days_90_plus_amount: 2000.00,
      total_amount: 4750.00
    },
    {
      company_id: "3",
      company_name: "Global Industries", 
      current_amount: 0,
      days_30_amount: 0,
      days_60_amount: 0,
      days_90_plus_amount: 1500.00,
      total_amount: 1500.00
    },
    {
      company_id: "4",
      company_name: "Innovate Solutions",
      current_amount: 3200.00,
      days_30_amount: 0,
      days_60_amount: 0,
      days_90_plus_amount: 0,
      total_amount: 3200.00
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTotalSummary = () => {
    return mockARData.reduce(
      (acc, item) => ({
        current: acc.current + item.current_amount,
        days_30: acc.days_30 + item.days_30_amount,
        days_60: acc.days_60 + item.days_60_amount,
        days_90_plus: acc.days_90_plus + item.days_90_plus_amount,
        total: acc.total + item.total_amount
      }),
      { current: 0, days_30: 0, days_60: 0, days_90_plus: 0, total: 0 }
    );
  };

  const getChartData = () => {
    const totals = getTotalSummary();
    return [
      { name: "Current (0-30)", amount: totals.current, color: "#10b981" },
      { name: "31-60 days", amount: totals.days_30, color: "#f59e0b" },
      { name: "61-90 days", amount: totals.days_60, color: "#f97316" },
      { name: "90+ days", amount: totals.days_90_plus, color: "#ef4444" }
    ];
  };

  const getBarChartData = () => {
    return mockARData.map(company => ({
      name: company.company_name.split(' ')[0], // Short name for chart
      current: company.current_amount,
      days_30: company.days_30_amount,
      days_60: company.days_60_amount,
      days_90_plus: company.days_90_plus_amount
    }));
  };

  const handleExportPDF = () => {
    toast.info("Exporting A/R report to PDF...");
  };

  const handleExportCSV = () => {
    toast.info("Exporting A/R report to CSV...");
  };

  const handleViewInvoices = (companyName: string) => {
    toast.info(`Viewing invoices for ${companyName}...`);
  };

  const totals = getTotalSummary();

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            A/R Summary Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center space-y-2">
              <div className="text-xl font-bold text-success">
                {formatCurrency(totals.current)}
              </div>
              <div className="text-sm text-muted-foreground">Current</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-xl font-bold text-warning">
                {formatCurrency(totals.days_30)}
              </div>
              <div className="text-sm text-muted-foreground">31-60 days</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-xl font-bold text-orange-500">
                {formatCurrency(totals.days_60)}
              </div>
              <div className="text-sm text-muted-foreground">61-90 days</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-xl font-bold text-destructive">
                {formatCurrency(totals.days_90_plus)}
              </div>
              <div className="text-sm text-muted-foreground">90+ days</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-xl font-bold text-foreground">
                {formatCurrency(totals.total)}
              </div>
              <div className="text-sm text-muted-foreground">Total A/R</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-success">
                {formatCurrency(totals.current)}
              </div>
              <div className="text-sm text-muted-foreground">Current (0-30 days)</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-warning">
                {formatCurrency(totals.days_30)}
              </div>
              <div className="text-sm text-muted-foreground">31-60 days</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-orange-500">
                {formatCurrency(totals.days_60)}
              </div>
              <div className="text-sm text-muted-foreground">61-90 days</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(totals.days_90_plus)}
              </div>
              <div className="text-sm text-muted-foreground">90+ days</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(totals.total)}
              </div>
              <div className="text-sm text-muted-foreground">Total A/R</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Report */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Accounts Receivable Aging Report
              </CardTitle>
              <CardDescription>
                Outstanding balances by aging period
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewType === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("table")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Table
              </Button>
              <Button
                variant={viewType === "chart" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("chart")}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Chart
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewType === "table" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">31-60 Days</TableHead>
                    <TableHead className="text-right">61-90 Days</TableHead>
                    <TableHead className="text-right">90+ Days</TableHead>
                    <TableHead className="text-right">Total Due</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockARData.map((company) => (
                    <TableRow key={company.company_id}>
                      <TableCell className="font-medium">
                        {company.company_name}
                      </TableCell>
                      <TableCell className="text-right text-success">
                        {formatCurrency(company.current_amount)}
                      </TableCell>
                      <TableCell className="text-right text-warning">
                        {formatCurrency(company.days_30_amount)}
                      </TableCell>
                      <TableCell className="text-right text-orange-500">
                        {formatCurrency(company.days_60_amount)}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        {formatCurrency(company.days_90_plus_amount)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(company.total_amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewInvoices(company.company_name)}
                        >
                          View Invoices
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-medium bg-muted/50">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totals.current)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totals.days_30)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totals.days_60)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totals.days_90_plus)}
                    </TableCell>
                    <TableCell className="text-right text-lg">
                      {formatCurrency(totals.total)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Bar Chart by Company */}
              <div>
                <h3 className="text-lg font-medium mb-4">A/R by Company</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getBarChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="current" fill="#10b981" name="Current" />
                    <Bar dataKey="days_30" fill="#f59e0b" name="31-60 days" />
                    <Bar dataKey="days_60" fill="#f97316" name="61-90 days" />
                    <Bar dataKey="days_90_plus" fill="#ef4444" name="90+ days" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart Total Distribution */}
              <div>
                <h3 className="text-lg font-medium mb-4">Total A/R Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getChartData()}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                      label={({name, value}) => `${name}: ${formatCurrency(value)}`}
                    >
                      {getChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Export the A/R aging report in different formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button onClick={handleExportPDF} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};