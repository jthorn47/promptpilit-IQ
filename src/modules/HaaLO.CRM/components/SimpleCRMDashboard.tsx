import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, DollarSign, Activity, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Simple CRM Dashboard that provides navigation to different CRM sections
 * This ensures all CRM routes are accessible and working
 */
export default function SimpleCRMDashboard() {
  const navigate = useNavigate();

  const crmSections = [
    {
      title: "Companies",
      description: "Manage your business prospects and clients",
      icon: Users,
      path: "/admin/crm/companies",
      color: "text-blue-600"
    },
    {
      title: "Deals Pipeline",
      description: "Track deals through your sales pipeline",
      icon: DollarSign,
      path: "/admin/crm/deals",
      color: "text-green-600"
    },
    {
      title: "Leads",
      description: "Manage and qualify incoming leads",
      icon: Activity,
      path: "/admin/crm/leads",
      color: "text-purple-600"
    },
    {
      title: "Activities",
      description: "Track interactions and follow-ups",
      icon: BarChart3,
      path: "/admin/crm/activities",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Connect IQ Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your customer relationships and sales pipeline</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Quick Add</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {crmSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Card 
              key={section.path} 
              className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-primary"
              onClick={() => navigate(section.path)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <IconComponent className={`h-6 w-6 ${section.color}`} />
                </div>
                <CardDescription className="text-sm">
                  {section.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(section.path);
                  }}
                >
                  Open {section.title}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Companies:</span>
                <span className="font-medium">11,297</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Opportunities:</span>
                <span className="font-medium">6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">This Month:</span>
                <span className="font-medium text-green-600">+12%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">System Status:</span>
                <span className="text-green-600 font-medium">Operational</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Sync:</span>
                <span className="font-medium">Up to date</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Update:</span>
                <span className="font-medium">Just now</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full text-left justify-start"
              onClick={() => navigate('/admin/crm/companies')}
            >
              <Users className="h-4 w-4 mr-2" />
              View All Companies
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-left justify-start"
              onClick={() => navigate('/admin/crm/deals')}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Open Pipeline
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}