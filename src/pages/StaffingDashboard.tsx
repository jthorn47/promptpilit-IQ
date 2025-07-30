import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, DollarSign, TrendingUp, Clock, UserCheck, AlertTriangle, Calendar } from "lucide-react";

export default function StaffingDashboard() {
  const stats = [
    {
      title: "Active Placements",
      value: "1,247",
      change: "+12.5%",
      icon: UserCheck,
      color: "text-green-600"
    },
    {
      title: "Open Positions",
      value: "186",
      change: "+5.2%",
      icon: Briefcase,
      color: "text-blue-600"
    },
    {
      title: "Total Candidates",
      value: "5,432",
      change: "+8.1%",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Monthly Revenue",
      value: "$342,890",
      change: "+15.3%",
      icon: DollarSign,
      color: "text-green-600"
    }
  ];

  const recentPlacements = [
    {
      id: 1,
      candidate: "Sarah Johnson",
      position: "Senior Developer",
      client: "Tech Corp Inc.",
      startDate: "2024-01-15",
      status: "Active",
      rate: "$85/hr"
    },
    {
      id: 2,
      candidate: "Mike Chen",
      position: "Project Manager",
      client: "Digital Solutions",
      startDate: "2024-01-12",
      status: "Active",
      rate: "$75/hr"
    },
    {
      id: 3,
      candidate: "Emily Davis",
      position: "UX Designer",
      client: "Creative Agency",
      startDate: "2024-01-10",
      status: "Pending",
      rate: "$65/hr"
    }
  ];

  const urgentTasks = [
    { id: 1, task: "Interview 3 candidates for DevOps role", due: "Today", priority: "High" },
    { id: 2, task: "Client onboarding meeting - TechStart", due: "Tomorrow", priority: "Medium" },
    { id: 3, task: "Background check follow-up", due: "This week", priority: "Low" }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staffing Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your workforce management center</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
          <Button>
            <Users className="w-4 h-4 mr-2" />
            New Placement
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Placements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Recent Placements
            </CardTitle>
            <CardDescription>Latest candidate placements and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPlacements.map((placement) => (
                <div key={placement.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{placement.candidate}</div>
                    <div className="text-sm text-muted-foreground">
                      {placement.position} at {placement.client}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Started: {placement.startDate}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={placement.status === "Active" ? "default" : "secondary"}>
                      {placement.status}
                    </Badge>
                    <div className="text-sm font-medium">{placement.rate}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Urgent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Priority Tasks
            </CardTitle>
            <CardDescription>Important tasks requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {urgentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{task.task}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3" />
                      Due: {task.due}
                    </div>
                  </div>
                  <Badge 
                    variant={
                      task.priority === "High" 
                        ? "destructive" 
                        : task.priority === "Medium" 
                        ? "default" 
                        : "secondary"
                    }
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Today's Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-sm text-muted-foreground">3 pending, 5 completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Weekly Placements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">
              <span className="text-green-600">+25%</span> vs last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Client Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-sm text-muted-foreground">Based on 47 reviews</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}