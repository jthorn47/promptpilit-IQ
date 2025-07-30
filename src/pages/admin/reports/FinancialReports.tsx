import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  BarChart3,
  Calculator,
  Download,
  RefreshCw
} from "lucide-react";

const FinancialReports = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("revenue");

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive financial analysis and business intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
            Reports IQ
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="profitability" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Profitability
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Costs
          </TabsTrigger>
          <TabsTrigger value="forecasts" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Forecasts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
              <CardDescription>
                Revenue streams, trends, and growth analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Revenue analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profitability Metrics</CardTitle>
              <CardDescription>
                Profit margins, ROI, and profitability analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Profitability reports coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis</CardTitle>
              <CardDescription>
                Cost breakdown, trends, and optimization opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Cost analysis coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Forecasts</CardTitle>
              <CardDescription>
                Predictive analytics and financial projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Financial forecasts coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialReports;