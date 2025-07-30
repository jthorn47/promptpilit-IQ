import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, Activity, Download } from 'lucide-react';
import { StandardLayout } from '@/components/layouts/StandardLayout';

export const ClientAnalyticsPage: React.FC = () => {
  const analyticsMetrics = [
    {
      title: 'Total Clients',
      value: '0',
      change: '+0%',
      description: 'vs last month',
      icon: Users,
      trend: 'neutral'
    },
    {
      title: 'Client Growth',
      value: '0%',
      change: '+0%',
      description: 'Monthly growth rate',
      icon: TrendingUp,
      trend: 'neutral'
    },
    {
      title: 'Active Engagement',
      value: '0%',
      change: '+0%',
      description: 'Client activity rate',
      icon: Activity,
      trend: 'neutral'
    },
    {
      title: 'Revenue per Client',
      value: '$0',
      change: '+0%',
      description: 'Average monthly',
      icon: BarChart3,
      trend: 'neutral'
    }
  ];

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <StandardLayout 
      title="Client Analytics"
      subtitle="Client performance metrics and reporting"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end">
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Analytics Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className={getTrendColor(metric.trend)}>{metric.change}</span>
                    <span className="text-muted-foreground">{metric.description}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Client Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Client Growth Trends</CardTitle>
            <CardDescription>Client acquisition and retention over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Data Available</h3>
              <p className="text-muted-foreground mb-4">Add clients to start seeing analytics and trends</p>
              <Button variant="outline">
                Add First Client
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Client Segmentation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Segmentation</CardTitle>
              <CardDescription>Breakdown by industry and size</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Segmentation Data</h3>
                <p className="text-muted-foreground">Client data will appear here once added</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Revenue trends and forecasting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Revenue Data</h3>
                <p className="text-muted-foreground">Revenue analytics will display here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardLayout>
  );
};