import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SimpleHROIQTest: React.FC = () => {
  console.log('🚀 SimpleHROIQTest component is mounting and rendering!');
  
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>HRO IQ Test Component</CardTitle>
        </CardHeader>
        <CardContent>
          <p>🎉 HRO IQ module is working! This is a simple test component.</p>
          <p>Current URL: {window.location.pathname}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleHROIQTest;