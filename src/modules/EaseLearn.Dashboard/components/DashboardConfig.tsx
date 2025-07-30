import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DashboardConfig: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Configure your EaseLearn dashboard settings here.</p>
      </CardContent>
    </Card>
  );
};