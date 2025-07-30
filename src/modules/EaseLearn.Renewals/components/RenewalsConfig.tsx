import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const RenewalsConfig: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Renewals Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Configure renewal schedules, notification settings, and automation rules.</p>
      </CardContent>
    </Card>
  );
};