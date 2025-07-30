import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Eye, AlertCircle, CheckCircle, Clock, DollarSign, Calendar } from "lucide-react";

export const ACHTransactionHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7d");

  // Mock transaction data
  const transactions = [
    {
      id: "txn_001",
      batchId: "batch_001",
      employeeId: "emp_001",
      employeeName: "Alice Johnson",
      amount: 2850.00,
      transactionCode: "22",
      accountType: "Checking",
      bankName: "Chase Bank",
      routingNumber: "****5678",
      accountNumber: "****1234",
      effectiveDate: "2024-01-16",
      processedDate: "2024-01-15T10:30:00Z",
      status: "processed",
      traceNumber: "123456789012345",
      returnCode: null,
      returnDescription: null
    },
    {
      id: "txn_002",
      batchId: "batch_001",
      employeeId: "emp_002",
      employeeName: "Bob Wilson",
      amount: 3200.00,
      transactionCode: "32",
      accountType: "Savings",
      bankName: "Bank of America",
      routingNumber: "****9876",
      accountNumber: "****5678",
      effectiveDate: "2024-01-16",
      processedDate: "2024-01-15T10:30:00Z",
      status: "processed",
      traceNumber: "123456789012346",
      returnCode: null,
      returnDescription: null
    },
    {
      id: "txn_003",
      batchId: "batch_002",
      employeeId: "emp_003",
      employeeName: "Carol Davis",
      amount: 2750.00,
      transactionCode: "22",
      accountType: "Checking",
      bankName: "Wells Fargo",
      routingNumber: "****3456",
      accountNumber: "****9012",
      effectiveDate: "2024-01-17",
      processedDate: "2024-01-16T14:15:00Z",
      status: "pending",
      traceNumber: "123456789012347",
      returnCode: null,
      returnDescription: null
    },
    {
      id: "txn_004",
      batchId: "batch_001",
      employeeId: "emp_004",
      employeeName: "David Brown",
      amount: 3050.00,
      transactionCode: "22",
      accountType: "Checking",
      bankName: "US Bank",
      routingNumber: "****7890",
      accountNumber: "****3456",
      effectiveDate: "2024-01-16",
      processedDate: "2024-01-15T10:30:00Z",
      status: "returned",
      traceNumber: "123456789012348",
      returnCode: "R03",
      returnDescription: "No Account/Unable to Locate Account"
    },
    {
      id: "txn_005",
      batchId: "batch_002",
      employeeId: "emp_005",
      employeeName: "Emma Garcia",
      amount: 2900.00,
      transactionCode: "32",
      accountType: "Savings",
      bankName: "TD Bank",
      routingNumber: "****2345",
      accountNumber: "****6789",
      effectiveDate: "2024-01-17",
      processedDate: "2024-01-16T14:15:00Z",
      status: "failed",
      traceNumber: "123456789012349",
      returnCode: "R01",
      returnDescription: "Insufficient Funds"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
      case "returned":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Processed</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Failed</Badge>;
      case "returned":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Returned</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.traceNumber.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const totalAmount = filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0);
  const processedCount = filteredTransactions.filter(txn => txn.status === 'processed').length;
  const failedCount = filteredTransactions.filter(txn => txn.status === 'failed' || txn.status === 'returned').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Transactions</p>
                <p className="text-2xl font-bold">{filteredTransactions.length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Successful</p>
                <p className="text-2xl font-bold">{processedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Failed/Returned</p>
                <p className="text-2xl font-bold">{failedCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Detailed history of all ACH transactions and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee, bank, or trace number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Transaction Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trace Number</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{transaction.employeeName}</span>
                        <span className="text-sm text-muted-foreground">{transaction.employeeId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-medium">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{transaction.accountType}</span>
                        <span className="text-xs text-muted-foreground">
                          {transaction.routingNumber} • {transaction.accountNumber}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.bankName}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{transaction.effectiveDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(transaction.status)}
                        {getStatusBadge(transaction.status)}
                      </div>
                      {transaction.returnCode && (
                        <div className="text-xs text-red-600 mt-1">
                          {transaction.returnCode}: {transaction.returnDescription}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {transaction.traceNumber}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};