import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { ForecastingDashboard } from '@/modules/HaaLO.CRM/components/ForecastingDashboard';

const Pipelines = () => {
  return (
    <StandardPageLayout 
      title="Pipelines & Stages"
      subtitle="Manage sales pipelines and deal stages"
    >
      <ForecastingDashboard />
    </StandardPageLayout>
  );
};

export default Pipelines;