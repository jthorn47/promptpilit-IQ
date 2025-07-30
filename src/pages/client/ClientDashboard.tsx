
import React from 'react';
import { CompanyModulesGrid } from '@/components/client/CompanyModulesGrid';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

export default function ClientDashboard() {
  return (
    <StandardPageLayout
      title="Company Dashboard"
      subtitle="Manage your organization's tools and services"
    >
      <CompanyModulesGrid />
    </StandardPageLayout>
  );
}
