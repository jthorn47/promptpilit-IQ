import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAutomations } from "@/modules/HaaLO.CRM/hooks/useAutomations";
import { useState } from "react";
import { Plus, Play, Pause, Settings, Activity, Mail, Calendar, Zap } from "lucide-react";

export default function AutomationsPage() {
  const { automations, metrics, loading, toggleAutomation } = useAutomations();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM Automations</h1>
          <p className="text-muted-foreground">
            Automate your sales processes and workflows
          </p>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : metrics.totalActive}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : metrics.totalExecutions}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Runs</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : metrics.recentExecutions}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : `${metrics.successRate}%`}</div>
              <p className="text-xs text-muted-foreground">Execution success</p>
            </CardContent>
          </Card>
        </div>

        {/* Automation Management */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Automation
            </Button>
          </div>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Automation Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <span>Email Follow-ups</span>
                    </div>
                    <Badge variant="secondary">3 active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-green-500" />
                      <span>Meeting Reminders</span>
                    </div>
                    <Badge variant="secondary">2 active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Activity className="w-5 h-5 text-purple-500" />
                      <span>Lead Scoring</span>
                    </div>
                    <Badge variant="secondary">1 active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email sequence completed</span>
                      <span className="text-xs text-muted-foreground">2 min ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Lead assigned to sales rep</span>
                      <span className="text-xs text-muted-foreground">15 min ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Meeting reminder sent</span>
                      <span className="text-xs text-muted-foreground">1 hour ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workflows">
            <Card>
              <CardHeader>
                <CardTitle>Active Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center text-muted-foreground">Loading automations...</div>
                ) : automations.length === 0 ? (
                  <div className="text-center space-y-4">
                    <div className="text-muted-foreground">No automations created yet</div>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Automation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {automations.map((automation) => (
                      <div key={automation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <h4 className="font-medium">{automation.name}</h4>
                          <p className="text-sm text-muted-foreground">{automation.description}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant={automation.is_active ? "default" : "secondary"}>
                              {automation.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">{automation.trigger_type}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAutomation(automation.id, !automation.is_active)}
                          >
                            {automation.is_active ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Email Nurture Sequence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Automatically send a series of follow-up emails to new leads
                  </p>
                  <Button variant="outline" className="w-full">Use Template</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lead Scoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Automatically score leads based on their activities and engagement
                  </p>
                  <Button variant="outline" className="w-full">Use Template</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Meeting Reminders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Send automatic reminders before scheduled meetings
                  </p>
                  <Button variant="outline" className="w-full">Use Template</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
}