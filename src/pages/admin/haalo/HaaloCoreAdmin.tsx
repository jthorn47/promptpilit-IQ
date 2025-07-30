import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  Server, 
  Shield, 
  Users, 
  Settings, 
  Activity,
  Zap,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";

const systemServices = [
  {
    name: "Core Database",
    status: "online",
    uptime: "99.98%",
    description: "Primary PostgreSQL cluster with Supabase",
    icon: Database
  },
  {
    name: "Authentication Service", 
    status: "online",
    uptime: "99.95%",
    description: "User authentication and authorization",
    icon: Shield
  },
  {
    name: "User Management",
    status: "online", 
    uptime: "99.97%",
    description: "User profiles and role management",
    icon: Users
  },
  {
    name: "Settings Engine",
    status: "maintenance",
    uptime: "98.12%", 
    description: "Configuration and preferences management",
    icon: Settings
  },
  {
    name: "Activity Logging",
    status: "online",
    uptime: "99.92%",
    description: "System audit and activity tracking",
    icon: Activity
  },
  {
    name: "Edge Functions",
    status: "degraded",
    uptime: "97.85%",
    description: "Serverless functions and API gateway",
    icon: Zap
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'online':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'maintenance':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'degraded':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <XCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'online':
      return 'default';
    case 'maintenance':
      return 'secondary';
    case 'degraded':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const HaaloCoreAdmin = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HaaLO Core Admin</h1>
          <p className="text-muted-foreground">
            System administration and core service management
          </p>
        </div>
        <Button variant="outline">
          <Server className="h-4 w-4 mr-2" />
          System Status
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systemServices.map((service) => {
          const Icon = service.icon;
          return (
            <Card key={service.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {service.name}
                  </div>
                </CardTitle>
                {getStatusIcon(service.status)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{service.uptime}</div>
                <p className="text-xs text-muted-foreground">
                  {service.description}
                </p>
                <div className="mt-3">
                  <Badge variant={getStatusBadgeVariant(service.status) as any}>
                    {service.status.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">6</div>
              <div className="text-sm text-muted-foreground">Active Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">18</div>
              <div className="text-sm text-muted-foreground">Core Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">99.2%</div>
              <div className="text-sm text-muted-foreground">Overall Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">247</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HaaloCoreAdmin;