import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const CoursesConfig: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Management Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Configure course management settings, SCORM parameters, and content standards.</p>
      </CardContent>
    </Card>
  );
};