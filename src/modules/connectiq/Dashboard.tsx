import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { CRMDashboard } from '@/modules/HaaLO.CRM/components/CRMDashboard';

const Dashboard = () => {
  return (
    <StandardPageLayout 
      title="CRM Dashboard"
      subtitle="Customer relationship management overview"
    >
      <CRMDashboard />
    </StandardPageLayout>
  );
};

export default Dashboard;