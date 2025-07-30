import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, Target } from "lucide-react";

export default function EarningsManager() {
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Earnings Dashboard</h1>
        <p className="text-muted-foreground">
          Track your commission earnings and performance metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,250</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$28,750</div>
            <p className="text-xs text-muted-foreground">
              Platform fee tier: 25%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,850</div>
            <p className="text-xs text-muted-foreground">
              Awaiting collection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-muted-foreground">
              $40K annual goal
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Earnings</CardTitle>
            <CardDescription>Your latest commission payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Acme Manufacturing</p>
                <p className="text-sm text-muted-foreground">Job #1023 - Warehouse Worker</p>
              </div>
              <div className="text-right">
                <p className="font-medium">$425.00</p>
                <Badge variant="secondary">Paid</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Pacific Logistics</p>
                <p className="text-sm text-muted-foreground">Job #1019 - Forklift Operator</p>
              </div>
              <div className="text-right">
                <p className="font-medium">$650.00</p>
                <Badge variant="secondary">Paid</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Metro Distribution</p>
                <p className="text-sm text-muted-foreground">Job #1015 - Team Lead</p>
              </div>
              <div className="text-right">
                <p className="font-medium">$890.00</p>
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commission Breakdown</CardTitle>
            <CardDescription>Earnings by category for {currentMonth}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Direct Placements</span>
              <span className="font-medium">$3,200</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Level 1 Overrides</span>
              <span className="font-medium">$750</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Level 2 Overrides</span>
              <span className="font-medium">$200</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Bonuses</span>
              <span className="font-medium">$100</span>
            </div>
            <div className="border-t pt-2 flex items-center justify-between font-medium">
              <span>Total Gross</span>
              <span>$4,250</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Platform Fee (25%)</span>
              <span>-$1,063</span>
            </div>
            <div className="border-t pt-2 flex items-center justify-between font-bold">
              <span>Net Earnings</span>
              <span>$3,187</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}