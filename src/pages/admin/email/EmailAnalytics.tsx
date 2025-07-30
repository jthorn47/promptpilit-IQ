import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Mail,
  Eye,
  MousePointer,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  RefreshCw,
  Download
} from "lucide-react";

const EmailAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for your email marketing performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
            Marketing IQ
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
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="audience" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Audience
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18,427</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24.8%</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  +2.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5.7%</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                  -0.3% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">9,234</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  +234 new this month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns</CardTitle>
                <CardDescription>
                  Campaigns with the highest engagement rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Product Launch Series",
                      openRate: "32.1%",
                      clickRate: "8.9%",
                      sent: "4,567"
                    },
                    {
                      name: "Welcome Email Sequence",
                      openRate: "28.7%", 
                      clickRate: "7.2%",
                      sent: "1,234"
                    },
                    {
                      name: "Monthly Newsletter",
                      openRate: "26.3%",
                      clickRate: "5.8%",
                      sent: "8,943"
                    },
                    {
                      name: "Customer Survey",
                      openRate: "24.9%",
                      clickRate: "4.1%",
                      sent: "2,156"
                    }
                  ].map((campaign, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{campaign.name}</h4>
                        <p className="text-xs text-muted-foreground">Sent to {campaign.sent} recipients</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Open:</span> {campaign.openRate}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Click:</span> {campaign.clickRate}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Performance Trends</CardTitle>
                <CardDescription>
                  30-day performance comparison
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Delivery Rate</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">98.2%</span>
                      <span className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +0.5%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Excellent delivery performance
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Bounce Rate</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">1.8%</span>
                      <span className="text-sm text-green-600 flex items-center">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        -0.3%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Well below industry average
                    </p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Unsubscribe Rate</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">0.4%</span>
                      <span className="text-sm text-muted-foreground">
                        Stable
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Healthy retention rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Detailed performance analysis and benchmarking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed performance metrics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audience Insights</CardTitle>
              <CardDescription>
                Demographics and behavior analysis of your email subscribers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Audience analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Historical trends and forecasting for email performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Trend analysis coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailAnalytics;