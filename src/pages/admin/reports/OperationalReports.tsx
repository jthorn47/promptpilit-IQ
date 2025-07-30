import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Clock, 
  Users, 
  Activity,
  TrendingUp,
  Download,
  RefreshCw,
  Target
} from "lucide-react";

const OperationalReports = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("productivity");

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operational Reports</h1>
          <p className="text-muted-foreground">
            Detailed operational metrics and performance analytics
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
          <TabsTrigger value="productivity" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Productivity
          </TabsTrigger>
          <TabsTrigger value="workforce" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Workforce
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="efficiency" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Efficiency
          </TabsTrigger>
        </TabsList>

        <TabsContent value="productivity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  +18% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4h</div>
                <p className="text-xs text-muted-foreground">
                  -15% improvement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.8%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87.5%</div>
                <p className="text-xs text-muted-foreground">
                  Optimal range
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Productivity Analysis</CardTitle>
              <CardDescription>
                Team productivity metrics and performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed productivity analytics will be displayed here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workforce" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workforce Analytics</CardTitle>
              <CardDescription>
                Employee metrics, capacity planning, and resource allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Workforce analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Key performance indicators and benchmarking data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Performance metrics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Efficiency Reports</CardTitle>
              <CardDescription>
                Process efficiency and optimization opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Efficiency reports coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OperationalReports;