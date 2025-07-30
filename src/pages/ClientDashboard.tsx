import React from 'react';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export const ClientDashboard: React.FC = () => {
  const { user, companyId } = useAuth();

  return (
    <UnifiedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Client Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your client dashboard</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dashboard Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">Client dashboard coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </UnifiedLayout>
  );
};

export default ClientDashboard;