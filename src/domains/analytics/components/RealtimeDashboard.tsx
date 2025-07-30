import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Monitor, 
  Activity, 
  Users, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3
} from "lucide-react";

const RealtimeDashboard = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const toggleLiveMode = () => {
    setIsLive(!isLive);
  };

  const realTimeMetrics = [
    {
      title: "Active Users",
      value: "1,247",
      change: "+12",
      changeType: "increase",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      status: "normal"
    },
    {
      title: "Revenue Today",
      value: "$23,580",
      change: "+8.2%",
      changeType: "increase", 
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      status: "normal"
    },
    {
      title: "System Health",
      value: "99.8%",
      change: "All systems operational",
      changeType: "normal",
      icon: <Activity className="h-4 w-4 text-muted-foreground" />,
      status: "healthy"
    },
    {
      title: "Alert Status",
      value: "2 Active",
      change: "1 new",
      changeType: "warning",
      icon: <AlertTriangle className="h-4 w-4 text-muted-foreground" />,
      status: "warning"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "text-green-600";
      case "warning": return "text-orange-600";
      case "critical": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case "increase": return "text-green-600";
      case "decrease": return "text-red-600";
      case "warning": return "text-orange-600";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real-time Dashboard</h1>
          <p className="text-muted-foreground">
            Live monitoring and real-time business metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm text-muted-foreground">
              {isLive ? 'Live' : 'Paused'}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleLiveMode}
          >
            <Monitor className="h-4 w-4 mr-2" />
            {isLive ? 'Pause' : 'Resume'} Live
          </Button>
        </div>
      </div>

      {/* Live Status Bar */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">All Systems Operational</span>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                99.8% Uptime
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Clock className="h-4 w-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {realTimeMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs ${getChangeColor(metric.changeType)}`}>
                {metric.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Live Activity Feed
            </CardTitle>
            <CardDescription>
              Real-time user activity and system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: "2 min ago", event: "New user registration", type: "user", color: "text-blue-600" },
                { time: "5 min ago", event: "Payment processed: $1,250", type: "payment", color: "text-green-600" },
                { time: "8 min ago", event: "System backup completed", type: "system", color: "text-gray-600" },
                { time: "12 min ago", event: "Alert resolved: Server load", type: "alert", color: "text-orange-600" },
                { time: "15 min ago", event: "New client onboarded", type: "client", color: "text-purple-600" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${activity.color.replace('text-', 'bg-')}`} />
                    <span className="text-sm">{activity.event}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Monitor
            </CardTitle>
            <CardDescription>
              Real-time system performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU Usage</span>
                  <span>23%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '23%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory Usage</span>
                  <span>67%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '67%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Network I/O</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Database Load</span>
                  <span>31%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '31%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Active Alerts
          </CardTitle>
          <CardDescription>
            Current system alerts and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900">High Memory Usage</p>
                  <p className="text-sm text-orange-700">Server memory usage above 80% threshold</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                Warning
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Traffic Spike Detected</p>
                  <p className="text-sm text-blue-700">Unusual increase in user activity - monitoring</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                Info
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeDashboard;