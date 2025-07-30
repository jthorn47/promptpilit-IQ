import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { AdvancedAnalytics } from '@/modules/HaaLO.CRM/components/AdvancedAnalytics';

const DealValueReporting = () => {
  return (
    <StandardPageLayout 
      title="Deal Value Reporting"
      subtitle="Analyze deal values and revenue metrics"
    >
      <AdvancedAnalytics />
    </StandardPageLayout>
  );
};

export default DealValueReporting;