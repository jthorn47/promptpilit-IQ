import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Integrations: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4 text-muted-foreground">
          Integrations functionality will be implemented in a future update.
        </div>
      </CardContent>
    </Card>
  );
};