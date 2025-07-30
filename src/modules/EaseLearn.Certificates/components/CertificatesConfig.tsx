import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const CertificatesConfig: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Certificates Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Configure certificate templates, generation settings, and verification options.</p>
      </CardContent>
    </Card>
  );
};