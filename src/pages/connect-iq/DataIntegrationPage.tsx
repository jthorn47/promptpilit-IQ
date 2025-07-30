import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

export const DataIntegrationPage: React.FC = () => {
  return (
    <StandardPageLayout
      title="Data Integration"
      subtitle="Connect and sync data across systems"
    >

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Manage connections to external databases and data sources.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Set up and configure API integrations with third-party services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Configure automated data synchronization schedules and rules.
            </p>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
};