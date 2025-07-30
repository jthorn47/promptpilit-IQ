import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { CompaniesManager } from '@/modules/HaaLO.CRM/components/CompaniesManager';

const Companies = () => {
  return (
    <StandardPageLayout 
      title="Companies"
      subtitle="Manage your company accounts and contacts"
    >
      <CompaniesManager />
    </StandardPageLayout>
  );
};

export default Companies;