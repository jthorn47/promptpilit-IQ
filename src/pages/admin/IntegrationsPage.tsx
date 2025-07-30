import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { AdvancedIntegrationHub } from '@/components/AdvancedIntegrationHub';

export const IntegrationsPage = () => {
  return (
    <StandardPageLayout
      title="Integration Hub"
      subtitle="Manage integrations, monitor webhooks, and track security events"
      badge="System Management"
    >
      <AdvancedIntegrationHub />
    </StandardPageLayout>
  );
};