import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const KBConfig: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Base Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Configure knowledge base settings, categories, and content organization.</p>
      </CardContent>
    </Card>
  );
};