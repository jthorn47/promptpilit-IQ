import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, FileText, Download } from 'lucide-react';

export default function Finance() {
  const financialData = {
    totalRevenue: 124592,
    monthlyGrowth: 12.5,
    expenses: 89240,
    profit: 35352,
    invoicesPending: 8,
    invoicesPaid: 45
  };

  const recentTransactions = [
    {
      id: 1,
      description: "Client Payment - Acme Corp",
      amount: 15000,
      type: "income", 
      date: "2024-01-15",
      status: "completed"
    },
    {
      id: 2,
      description: "Software Licenses",
      amount: -2400,
      type: "expense",
      date: "2024-01-14", 
      status: "completed"
    },
    {
      id: 3,
      description: "Marketing Campaign",
      amount: -8500,
      type: "expense",
      date: "2024-01-12",
      status: "pending"
    },
    {
      id: 4,
      description: "Consulting Services - TechFlow",
      amount: 22000,
      type: "income",
      date: "2024-01-10",
      status: "completed"
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  return (
    <StandardPageLayout
      title="Financial Reports"
      subtitle="Track revenue, expenses, and financial performance"
      badge="Q4 2024"
      headerActions={
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      }
    >
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.totalRevenue)}</div>
            <div className="flex items-center mt-1">
              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{financialData.monthlyGrowth}%
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.expenses)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly operational costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Profit
            </CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(financialData.profit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((financialData.profit / financialData.totalRevenue) * 100)}% profit margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Invoices
            </CardTitle>
            <FileText className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {financialData.invoicesPending}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {financialData.invoicesPaid} paid this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest financial activity and transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className={`h-4 w-4 ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`} />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </p>
                  <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Monthly comparison over the past year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Chart component would go here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Categorized spending analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Pie chart would go here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
}