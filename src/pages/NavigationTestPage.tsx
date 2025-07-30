import React from 'react';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { NavigationDebug } from '@/components/debug/NavigationDebug';

const NavigationTestPage: React.FC = () => {
  return (
    <UnifiedLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Navigation System Test</h1>
        <NavigationDebug />
      </div>
    </UnifiedLayout>
  );
};

export default NavigationTestPage;