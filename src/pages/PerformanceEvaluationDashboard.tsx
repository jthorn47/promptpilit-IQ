import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, Users, FileText, Award, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PerformanceEvaluationDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    {
      title: "Active Review Cycles",
      value: "3",
      description: "Currently running evaluations",
      icon: Calendar,
      color: "bg-blue-500"
    },
    {
      title: "Pending Reviews",
      value: "24",
      description: "Awaiting completion",
      icon: FileText,
      color: "bg-orange-500"
    },
    {
      title: "Employees Reviewed",
      value: "156",
      description: "This quarter",
      icon: Users,
      color: "bg-green-500"
    },
    {
      title: "Avg Rating",
      value: "4.2",
      description: "Overall performance score",
      icon: Award,
      color: "bg-purple-500"
    }
  ];

  const recentCycles = [
    {
      id: "1",
      name: "Q4 2024 Performance Review",
      status: "active",
      participants: 45,
      completed: 32,
      dueDate: "2024-12-31"
    },
    {
      id: "2", 
      name: "Annual Review 2024",
      status: "planning",
      participants: 120,
      completed: 0,
      dueDate: "2025-01-15"
    },
    {
      id: "3",
      name: "Probation Reviews",
      status: "completed",
      participants: 8,
      completed: 8,
      dueDate: "2024-11-30"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary-muted/10 p-4 space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-primary opacity-5 blur-3xl" />
        <div className="relative bg-gradient-card rounded-2xl p-8 shadow-soft border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Performance Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage employee evaluations, development plans, and performance tracking
              </p>
            </div>
            <Button 
              onClick={() => navigate("/admin/performance/review-cycles/new")}
              className="gradient-button hover-scale"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Review Cycle
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden hover-scale transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}/10`}>
                  <Icon className={`w-4 h-4 text-${stat.color.replace('bg-', '')}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cycles">Review Cycles</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Review Cycles</CardTitle>
                <CardDescription>
                  Latest performance evaluation cycles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentCycles.map((cycle) => (
                  <div key={cycle.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{cycle.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {cycle.completed}/{cycle.participants} completed • Due {cycle.dueDate}
                      </p>
                    </div>
                    <Badge variant={
                      cycle.status === 'active' ? 'default' :
                      cycle.status === 'planning' ? 'secondary' : 'outline'
                    }>
                      {cycle.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>
                  Overall performance metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  <div className="text-center space-y-2">
                    <TrendingUp className="w-12 h-12 mx-auto opacity-50" />
                    <p>Performance analytics coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cycles" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Review Cycles</CardTitle>
                <CardDescription>
                  Manage all performance review cycles
                </CardDescription>
              </div>
              <Button onClick={() => navigate("/admin/performance/review-cycles/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Cycle
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCycles.map((cycle) => (
                  <div key={cycle.id} className="flex items-center justify-between p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{cycle.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{cycle.participants} participants</span>
                        <span>•</span>
                        <span>{cycle.completed} completed</span>
                        <span>•</span>
                        <span>Due {cycle.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={
                        cycle.status === 'active' ? 'default' :
                        cycle.status === 'planning' ? 'secondary' : 'outline'
                      }>
                        {cycle.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Evaluation Templates</CardTitle>
                <CardDescription>
                  Create and manage evaluation templates
                </CardDescription>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No evaluation templates created yet</p>
                <p className="text-sm">Create your first template to get started</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Comprehensive performance insights and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboard coming soon</p>
                <p className="text-sm">View detailed performance metrics and trends</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}