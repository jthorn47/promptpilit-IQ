import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Users, TrendingUp, FileText, Target, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

const ConsultingDashboard = () => {
  const navigate = useNavigate();

  const consultingServices = [
    {
      title: "Risk Assessment",
      description: "Comprehensive workplace risk assessments",
      icon: Target,
      color: "bg-red-500",
      route: "/admin/consulting/assessment",
      stats: "24 Active",
      badge: "Critical"
    },
    {
      title: "Handbook Builder",
      description: "Create and manage employee handbooks",
      icon: FileText,
      color: "bg-blue-500",
      route: "/admin/consulting/handbook-builder",
      stats: "12 Templates",
      badge: "Popular"
    },
    {
      title: "Compliance Tracking",
      description: "Monitor and track compliance requirements",
      icon: ClipboardList,
      color: "bg-green-500",
      route: "/admin/consulting/compliance",
      stats: "89% Complete",
      badge: "On Track"
    },
    {
      title: "Training Modules",
      description: "Custom training program development",
      icon: Users,
      color: "bg-purple-500",
      route: "/admin/consulting/training",
      stats: "45 Modules",
      badge: "Growing"
    },
    {
      title: "Policy Management",
      description: "Develop and manage company policies",
      icon: FileText,
      color: "bg-orange-500",
      route: "/admin/consulting/policies",
      stats: "18 Policies",
      badge: "Updated"
    },
    {
      title: "Document Library",
      description: "Centralized document management",
      icon: FileText,
      color: "bg-teal-500",
      route: "/admin/consulting/documents",
      stats: "156 Files",
      badge: "Organized"
    }
  ];

  const recentActivity = [
    { type: "Assessment", client: "TechCorp Inc", status: "Completed", time: "2 hours ago" },
    { type: "Handbook", client: "RetailMax", status: "In Progress", time: "4 hours ago" },
    { type: "Compliance", client: "Manufacturing Co", status: "Review", time: "1 day ago" },
    { type: "Training", client: "ServicePro", status: "Scheduled", time: "2 days ago" }
  ];

  return (
    <StandardPageLayout
      title="Consulting Services Dashboard"
      subtitle="Manage consulting services, assessments, and client deliverables"
      badge="Active"
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assessments</p>
                  <p className="text-2xl font-bold">18</p>
                </div>
                <Target className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clients Served</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">$45K</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Consulting Services Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Consulting Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {consultingServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(service.route)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg ${service.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="secondary">{service.badge}</Badge>
                      </div>
                      <h3 className="font-semibold mb-2">{service.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{service.stats}</span>
                        <Button size="sm" variant="outline">
                          Access
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">{activity.type} - {activity.client}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <Badge variant={activity.status === 'Completed' ? 'default' : 'secondary'}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
};

export default ConsultingDashboard;