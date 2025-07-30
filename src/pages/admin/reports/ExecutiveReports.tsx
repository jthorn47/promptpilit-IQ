import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  Download,
  RefreshCw
} from "lucide-react";

const ExecutiveReports = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleRefresh = () => {
    setLoading(true);
    // Simulate data refresh
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Reports</h1>
          <p className="text-muted-foreground">
            High-level insights and KPIs for executive decision making
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
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="operational" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Operational
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Growth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2.4M</div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from last quarter
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">148</div>
                <p className="text-xs text-muted-foreground">
                  +8 new this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23.8%</div>
                <p className="text-xs text-muted-foreground">
                  Year over year
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Client Retention</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">
                  Above industry average
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>
                Key performance indicators and business metrics overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Revenue Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Strong quarterly performance with 12.5% growth driven by new client acquisitions and expanded service offerings.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Client Base</h4>
                  <p className="text-sm text-muted-foreground">
                    Steady growth in active client base with excellent retention rates above industry standards.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Strategic Outlook</h4>
                  <p className="text-sm text-muted-foreground">
                    Well-positioned for continued growth with strong fundamentals and expanding market opportunities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Performance</CardTitle>
              <CardDescription>
                Revenue, profitability, and financial health metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Financial reports and analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operational Metrics</CardTitle>
              <CardDescription>
                Efficiency, productivity, and operational performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Operational reports and analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Growth Analytics</CardTitle>
              <CardDescription>
                Market expansion, client acquisition, and growth trajectory analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Growth reports and analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExecutiveReports;