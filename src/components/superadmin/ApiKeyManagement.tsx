import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ApiKeyManagement: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4 text-muted-foreground">
          API key management functionality will be implemented in a future update.
        </div>
      </CardContent>
    </Card>
  );
};