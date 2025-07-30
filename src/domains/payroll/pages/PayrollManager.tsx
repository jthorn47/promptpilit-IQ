import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Users, Calendar, FileText, Download } from "lucide-react";

import { useState } from "react";

const PayrollManager = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  
  const payrollData = [
    { id: 1, period: "2024-01", employees: 45, grossPay: 125000, netPay: 95000, status: "Processed" },
    { id: 2, period: "2024-02", employees: 48, grossPay: 132000, netPay: 101000, status: "Processing" },
    { id: 3, period: "2024-03", employees: 52, grossPay: 142000, netPay: 108500, status: "Pending" },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Processing 💰</h1>
          <p className="text-muted-foreground">Comprehensive payroll management and processing center</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">Payroll</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">52</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Gross</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$142,000</div>
              <p className="text-xs text-muted-foreground">+7.6% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$108,500</div>
              <p className="text-xs text-muted-foreground">After deductions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Payroll</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15th</div>
              <p className="text-xs text-muted-foreground">March 2024</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-auto flex-col gap-2 p-4">
                <FileText className="w-5 h-5" />
                <span className="text-sm">Process Payroll</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                <Users className="w-5 h-5" />
                <span className="text-sm">Manage Employees</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm">View Reports</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                <Download className="w-5 h-5" />
                <span className="text-sm">Export Data</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payroll History */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollData.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell className="font-medium">{payroll.period}</TableCell>
                    <TableCell>{payroll.employees}</TableCell>
                    <TableCell>${payroll.grossPay.toLocaleString()}</TableCell>
                    <TableCell>${payroll.netPay.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          payroll.status === "Processed" ? "default" :
                          payroll.status === "Processing" ? "secondary" : "outline"
                        }
                      >
                        {payroll.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PayrollManager;