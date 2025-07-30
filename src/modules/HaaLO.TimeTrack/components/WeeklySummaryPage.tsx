import React from 'react';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export const WeeklySummaryPage: React.FC = () => {
  const { user, companyId } = useAuth();

  return (
    <UnifiedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Weekly Summary</h1>
            <p className="text-muted-foreground">View your weekly time summary and submissions</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>This Week's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">Weekly summary coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </UnifiedLayout>
  );
};