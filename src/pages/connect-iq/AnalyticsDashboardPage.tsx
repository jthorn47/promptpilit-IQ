import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

export const AnalyticsDashboardPage: React.FC = () => {
  return (
    <StandardPageLayout
      title="Analytics Dashboard"
      subtitle="Unified analytics and reporting"
    >

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Track key performance indicators and business metrics.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Create and configure custom reports for your business needs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Real-time Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Get real-time insights and data visualization.
            </p>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
};