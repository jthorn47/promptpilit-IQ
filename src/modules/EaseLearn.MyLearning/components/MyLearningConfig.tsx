
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const MyLearningConfig: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Learning Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Configure personal learning dashboard settings, progress tracking, and course preferences.</p>
      </CardContent>
    </Card>
  );
};
