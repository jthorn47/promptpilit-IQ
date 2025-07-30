import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const CompanySettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4 text-muted-foreground">
          Company settings functionality will be implemented in a future update.
        </div>
      </CardContent>
    </Card>
  );
};