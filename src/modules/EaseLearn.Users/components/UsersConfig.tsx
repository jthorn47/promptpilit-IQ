import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const UsersConfig: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Configure user enrollment settings, progress tracking, and learner permissions.</p>
      </CardContent>
    </Card>
  );
};