import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, DollarSign, Activity, Target, Calendar } from "lucide-react";
import { useCrmAnalytics } from "@/modules/HaaLO.CRM/hooks/useCrmAnalytics";
import { useCRMNotifications } from "../hooks/useCRMNotifications";

export const CRMDashboard = () => {
  const analytics = useCrmAnalytics();
  
  // Initialize CRM notifications
  useCRMNotifications();

  if (analytics.isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading CRM dashboard...</div>
      </div>
    );
  }

  const metricCards = [
    {
      title: "Total Companies",
      value: analytics.totalCompanies || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Opportunities",
      value: analytics.totalOpportunities || 0,
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Proposals",
      value: analytics.proposalMetrics?.total || 0,
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "SPIN Completion",
      value: `${analytics.spinCompletionRate || 0}%`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Avg Deal Size",
      value: `$${(analytics.pipelineMetrics?.averageDealSize || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Pipeline Value",
      value: `$${(analytics.pipelineMetrics?.totalValue || 0).toLocaleString()}`,
      icon: Calendar,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Command Center</h1>
        <p className="text-gray-600 mt-2">Overview of your sales performance and pipeline</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>Latest prospects in your pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">New lead captured</p>
                  <p className="text-sm text-gray-600">From website contact form</p>
                </div>
                <Badge variant="secondary">New</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Follow-up scheduled</p>
                  <p className="text-sm text-gray-600">Call scheduled for tomorrow</p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Proposal sent</p>
                  <p className="text-sm text-gray-600">Waiting for client response</p>
                </div>
                <Badge>In Progress</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deal Progress</CardTitle>
            <CardDescription>Deals moving through your pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Enterprise Training Package</p>
                  <p className="text-sm text-gray-600">$25,000 - Negotiation</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">80%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Safety Compliance Audit</p>
                  <p className="text-sm text-gray-600">$15,000 - Proposal</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">60%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">HR Assessment Package</p>
                  <p className="text-sm text-gray-600">$8,000 - Qualified</p>
                </div>
                <Badge className="bg-purple-100 text-purple-800">40%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};