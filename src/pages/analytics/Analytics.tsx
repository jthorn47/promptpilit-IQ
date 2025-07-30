import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign, Activity, BarChart3, PieChart } from 'lucide-react';

export default function Analytics() {
  const metrics = [
    {
      title: "Total Revenue",
      value: "$124,592",
      change: "+12.5%",
      trend: "up",
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      title: "Active Users",
      value: "2,847",
      change: "+8.2%", 
      trend: "up",
      icon: <Users className="h-4 w-4" />
    },
    {
      title: "Conversion Rate",
      value: "24.8%",
      change: "+3.1%",
      trend: "up", 
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      title: "System Health",
      value: "99.2%",
      change: "-0.1%",
      trend: "down",
      icon: <Activity className="h-4 w-4" />
    }
  ];

  return (
    <StandardPageLayout
      title="Analytics Dashboard"
      subtitle="Track performance metrics and business insights"
      badge="Live Data"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center mt-1">
                <Badge 
                  variant={metric.trend === 'up' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {metric.change}
                </Badge>
                <span className="text-xs text-muted-foreground ml-2">
                  vs last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
            <CardDescription>
              Monthly revenue growth over the past year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Chart component would go here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              User Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of user segments and engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Pie chart would go here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
}