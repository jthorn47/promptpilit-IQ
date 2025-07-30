
import React from 'react';
import { StandardLayout } from '@/components/layouts/StandardLayout';
import { HandbookBuilder } from '@/components/consulting-services/handbook-builder/HandbookBuilder';

export const HandbookBuilderPage: React.FC = () => {
  return (
    <StandardLayout 
      title="Handbook Builder"
      subtitle="Create comprehensive employee handbooks with automated compliance updates"
    >
      <HandbookBuilder />
    </StandardLayout>
  );
};
