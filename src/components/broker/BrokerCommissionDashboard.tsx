import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Eye, DollarSign, TrendingUp, Calendar } from "lucide-react";

export const BrokerCommissionDashboard = () => {
  // Mock commission data
  const commissions = [
    {
      id: 1,
      clientName: "TechCorp Solutions",
      productCategory: "Payroll",
      commissionType: "referral",
      baseAmount: 25000,
      commissionRate: 8.5,
      commissionAmount: 2125,
      tierBonus: 425,
      totalCommission: 2550,
      paymentStatus: "paid",
      paymentDate: "2024-01-15",
      period: "Q1 2024"
    },
    {
      id: 2,
      clientName: "Manufacturing Plus",
      productCategory: "LMS + Payroll",
      commissionType: "recurring",
      baseAmount: 45000,
      commissionRate: 10.0,
      commissionAmount: 4500,
      tierBonus: 900,
      totalCommission: 5400,
      paymentStatus: "approved",
      paymentDate: null,
      period: "Q1 2024"
    },
    {
      id: 3,
      clientName: "Retail Dynamics",
      productCategory: "ATS",
      commissionType: "referral",
      baseAmount: 15000,
      commissionRate: 6.0,
      commissionAmount: 900,
      tierBonus: 0,
      totalCommission: 900,
      paymentStatus: "pending",
      paymentDate: null,
      period: "Q1 2024"
    }
  ];

  const statements = [
    {
      id: 1,
      statementNumber: "HB-2024-000001",
      period: "Q1 2024",
      totalCommissions: 8850,
      totalDeductions: 0,
      netAmount: 8850,
      status: "paid",
      generatedAt: "2024-01-31",
      paidAt: "2024-02-05"
    },
    {
      id: 2,
      statementNumber: "HB-2024-000002",
      period: "Q4 2023",
      totalCommissions: 12450,
      totalDeductions: 245,
      netAmount: 12205,
      status: "paid",
      generatedAt: "2023-12-31",
      paidAt: "2024-01-08"
    }
  ];

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    approved: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    disputed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  };

  const totalEarned = commissions.reduce((sum, comm) => sum + comm.totalCommission, 0);
  const pendingCommissions = commissions
    .filter(c => c.paymentStatus === 'pending' || c.paymentStatus === 'approved')
    .reduce((sum, comm) => sum + comm.totalCommission, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Commission Dashboard</h2>
        <p className="text-muted-foreground">Track your earnings and payment history</p>
      </div>

      {/* Commission Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earned
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${totalEarned.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              All-time commissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Payments
            </CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${pendingCommissions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Commission Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">8.2%</div>
            <p className="text-xs text-green-600">+0.8% vs last quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Details */}
      <Tabs defaultValue="commissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="commissions">Commission Details</TabsTrigger>
          <TabsTrigger value="statements">Payment Statements</TabsTrigger>
          <TabsTrigger value="breakdown">Product Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>Commission Transactions</CardTitle>
              <CardDescription>
                Detailed breakdown of your commission earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Base Amount</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Tier Bonus</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell className="font-medium">
                        {commission.clientName}
                      </TableCell>
                      <TableCell>{commission.productCategory}</TableCell>
                      <TableCell className="capitalize">
                        {commission.commissionType}
                      </TableCell>
                      <TableCell>
                        ${commission.baseAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>{commission.commissionRate}%</TableCell>
                      <TableCell>
                        ${commission.commissionAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ${commission.tierBonus.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${commission.totalCommission.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[commission.paymentStatus as keyof typeof statusColors]}>
                          {commission.paymentStatus.charAt(0).toUpperCase() + commission.paymentStatus.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statements">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Payment Statements</CardTitle>
                  <CardDescription>
                    Download your commission payment statements
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Statement #</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Gross Amount</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statements.map((statement) => (
                    <TableRow key={statement.id}>
                      <TableCell className="font-medium">
                        {statement.statementNumber}
                      </TableCell>
                      <TableCell>{statement.period}</TableCell>
                      <TableCell>
                        ${statement.totalCommissions.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ${statement.totalDeductions.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${statement.netAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[statement.status as keyof typeof statusColors]}>
                          {statement.status.charAt(0).toUpperCase() + statement.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(statement.generatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Commission by Product</CardTitle>
                <CardDescription>Earnings breakdown by service category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Payroll Services</span>
                  <span className="text-sm font-bold">$4,250</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "48%" }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">LMS & Training</span>
                  <span className="text-sm font-bold">$2,800</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "32%" }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">ATS & Recruiting</span>
                  <span className="text-sm font-bold">$1,800</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: "20%" }}></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tier Performance</CardTitle>
                <CardDescription>Your Gold tier benefits and progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Base Commission Rate</span>
                  <Badge variant="secondary">8.5%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tier Bonus Multiplier</span>
                  <Badge variant="secondary">1.2x</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Tier Bonuses</span>
                  <Badge variant="secondary">$1,325</Badge>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-2">
                    Progress to Platinum Tier
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    $65,000 / $100,000 annual revenue
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};