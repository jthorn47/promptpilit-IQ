import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";

const TrainingAnalytics = () => {
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: 'Analytics', href: '/admin/analytics' },
    { label: 'Training Analytics' }
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <BreadcrumbNav items={breadcrumbItems} />
      
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training Analytics</h1>
          <p className="text-muted-foreground">
            Monitor training progress, completion rates, and effectiveness across your organization.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Analytics Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Learners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certificates Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Training Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Detailed training progress analytics will be displayed here.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Paths</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Learning path completion and effectiveness metrics.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { TrainingAnalytics };