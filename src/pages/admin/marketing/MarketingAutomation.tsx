import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  Play, 
  Pause,
  Settings,
  Mail,
  Users,
  TrendingUp,
  Clock,
  RefreshCw,
  Plus
} from "lucide-react";

const MarketingAutomation = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("workflows");

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Automation</h1>
          <p className="text-muted-foreground">
            Automate your marketing campaigns and nurture leads efficiently
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
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="triggers" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Triggers
          </TabsTrigger>
          <TabsTrigger value="sequences" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Sequences
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  2 new this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Automation Rate</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87.3%</div>
                <p className="text-xs text-muted-foreground">
                  +5.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contacts Enrolled</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3,246</div>
                <p className="text-xs text-muted-foreground">
                  +18.4% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142h</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Automation Workflows</CardTitle>
              <CardDescription>
                Currently running marketing automation workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Welcome Series",
                    status: "Active",
                    trigger: "New Signup",
                    enrolled: "456",
                    completed: "342",
                    performance: "High"
                  },
                  {
                    name: "Lead Nurturing Campaign",
                    status: "Active",
                    trigger: "Downloaded Whitepaper",
                    enrolled: "234",
                    completed: "167",
                    performance: "Medium"
                  },
                  {
                    name: "Re-engagement Series",
                    status: "Paused",
                    trigger: "Inactive 30 days",
                    enrolled: "89",
                    completed: "23",
                    performance: "Low"
                  },
                  {
                    name: "Product Demo Follow-up",
                    status: "Active",
                    trigger: "Demo Completed",
                    enrolled: "123",
                    completed: "98",
                    performance: "High"
                  }
                ].map((workflow, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {workflow.status === "Active" ? (
                          <Play className="h-4 w-4 text-green-600" />
                        ) : (
                          <Pause className="h-4 w-4 text-orange-600" />
                        )}
                        <div>
                          <h4 className="font-medium">{workflow.name}</h4>
                          <p className="text-sm text-muted-foreground">Trigger: {workflow.trigger}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Enrolled:</span> {workflow.enrolled}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Completed:</span> {workflow.completed}
                      </div>
                      <Badge variant={
                        workflow.performance === "High" ? "default" :
                        workflow.performance === "Medium" ? "secondary" : "destructive"
                      }>
                        {workflow.performance}
                      </Badge>
                      <Badge variant={workflow.status === "Active" ? "default" : "secondary"}>
                        {workflow.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Triggers</CardTitle>
              <CardDescription>
                Configure triggers that start your automation workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Available Trigger Types</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Form submissions and lead captures</li>
                    <li>• Email opens, clicks, and engagement</li>
                    <li>• Website behavior and page visits</li>
                    <li>• Contact property changes</li>
                    <li>• Date-based triggers (anniversaries, renewals)</li>
                    <li>• Custom event triggers via API</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sequences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Sequences</CardTitle>
              <CardDescription>
                Automated email sequences and drip campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Email sequence management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Analytics</CardTitle>
              <CardDescription>
                Performance metrics for your automation workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Automation analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingAutomation;