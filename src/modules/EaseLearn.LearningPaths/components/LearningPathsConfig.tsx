import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const LearningPathsConfig: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Paths Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Configure learning path settings, prerequisites, and sequencing rules.</p>
      </CardContent>
    </Card>
  );
};