import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AdminConfig: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Configure system-wide administration settings for EaseLearn LMS.</p>
      </CardContent>
    </Card>
  );
};