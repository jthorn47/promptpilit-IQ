import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Mail,
  MousePointer,
  DollarSign,
  BarChart3,
  RefreshCw,
  Download
} from "lucide-react";

const MarketingDashboard = () => {
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
          <h1 className="text-3xl font-bold tracking-tight">Marketing Dashboard</h1>
          <p className="text-muted-foreground">
            Complete overview of your marketing performance and campaigns
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
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">
                  +12.3% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Campaign ROI</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">324%</div>
                <p className="text-xs text-muted-foreground">
                  +8.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Open Rate</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24.8%</div>
                <p className="text-xs text-muted-foreground">
                  +2.4% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.7%</div>
                <p className="text-xs text-muted-foreground">
                  +0.8% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Marketing Performance Overview</CardTitle>
              <CardDescription>
                Key marketing metrics and campaign performance summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Campaign Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Current campaigns are performing 15% above industry benchmarks with strong email engagement.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Lead Quality</h4>
                  <p className="text-sm text-muted-foreground">
                    Lead scoring shows 68% of new leads are sales-qualified with high conversion potential.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Channel Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Email marketing remains the top-performing channel with social media showing 23% growth.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>
                Current marketing campaigns and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Q1 2025 Growth Campaign",
                    status: "Active",
                    type: "Email + Social",
                    opens: "1,247",
                    clicks: "342",
                    conversions: "47"
                  },
                  {
                    name: "Product Launch Series",
                    status: "Active", 
                    type: "Multi-channel",
                    opens: "2,156",
                    clicks: "678",
                    conversions: "89"
                  },
                  {
                    name: "Customer Retention",
                    status: "Scheduled",
                    type: "Email",
                    opens: "-",
                    clicks: "-", 
                    conversions: "-"
                  }
                ].map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{campaign.name}</h4>
                      <p className="text-sm text-muted-foreground">{campaign.type}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Opens:</span> {campaign.opens}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Clicks:</span> {campaign.clicks}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Conversions:</span> {campaign.conversions}
                      </div>
                      <Badge variant={campaign.status === "Active" ? "default" : "secondary"}>
                        {campaign.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>
                Lead generation and qualification metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Lead management dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and performance insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Advanced analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingDashboard;