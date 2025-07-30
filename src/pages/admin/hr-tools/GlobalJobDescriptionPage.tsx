import React from 'react';
import { GlobalJobDescriptionBuilder } from '@/domains/hr/components/GlobalJobDescriptionBuilder';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

const GlobalJobDescriptionPage: React.FC = () => {
  return (
    <StandardPageLayout
      title="Global Job Descriptions"
      subtitle="Create and manage standardized job descriptions across all clients"
    >
      <GlobalJobDescriptionBuilder />
    </StandardPageLayout>
  );
};

export default GlobalJobDescriptionPage;