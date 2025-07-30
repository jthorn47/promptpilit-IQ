import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const MyCertificatesConfig: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Certificates Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Configure certificate display preferences and sharing settings.</p>
      </CardContent>
    </Card>
  );
};