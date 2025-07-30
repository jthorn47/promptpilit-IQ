import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const MediaConfig: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Configure Vimeo integration, video quality settings, and media storage options.</p>
      </CardContent>
    </Card>
  );
};