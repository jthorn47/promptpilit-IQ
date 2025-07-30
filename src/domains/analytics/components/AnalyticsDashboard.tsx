import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, PieChart, Activity } from "lucide-react";
import { useAnalyticsMetrics, useAnalyticsDashboards } from "../hooks";

export const AnalyticsDashboard = () => {
  const { metrics, loading: metricsLoading } = useAnalyticsMetrics();
  const { dashboards, loading: dashboardsLoading } = useAnalyticsDashboards();

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
      title: "Real-Time Dashboards",
      description: "Live performance metrics with customizable views for executives, managers, and teams.",
      capabilities: ["Executive Summaries", "Team Performance", "Individual Progress", "Compliance Status"]
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      title: "Predictive Analytics",
      description: "AI-powered insights that predict training outcomes and identify at-risk employees.",
      capabilities: ["Risk Prediction", "Performance Forecasting", "Completion Likelihood", "Intervention Alerts"]
    },
    {
      icon: <PieChart className="w-8 h-8 text-purple-600" />,
      title: "Advanced Reporting",
      description: "Comprehensive reports with drill-down capabilities and automated distribution.",
      capabilities: ["Custom Reports", "Automated Scheduling", "Data Export", "White-label Options"]
    },
    {
      icon: <Activity className="w-8 h-8 text-orange-600" />,
      title: "Performance Intelligence",
      description: "Deep insights into learning effectiveness and business impact correlation.",
      capabilities: ["ROI Analysis", "Skill Gap Identification", "Learning Path Optimization", "Behavioral Analytics"]
    }
  ];

  if (metricsLoading || dashboardsLoading) {
    return <div className="p-6">Loading analytics dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights and performance metrics</p>
        </div>
        <Button>Create Custom Dashboard</Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Metrics</p>
                <p className="text-2xl font-bold">{metrics.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Dashboards</p>
                <p className="text-2xl font-bold">{dashboards.length}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Data Points</p>
                <p className="text-2xl font-bold">2.4M</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-2xl font-bold">&lt; 2s</p>
              </div>
              <PieChart className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                  {feature.icon}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="space-y-1">
                  {feature.capabilities.map((capability, capIndex) => (
                    <div key={capIndex} className="text-sm text-gray-500 flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                      {capability}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};