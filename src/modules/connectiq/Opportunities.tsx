import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import DealsManager from '@/modules/HaaLO.CRM/components/DealsManager';

const Opportunities = () => {
  return (
    <StandardPageLayout 
      title="Opportunities"
      subtitle="Manage deals and sales opportunities"
    >
      <DealsManager />
    </StandardPageLayout>
  );
};

export default Opportunities;