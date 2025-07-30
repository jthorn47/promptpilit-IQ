import React from 'react';
import { useParams } from 'react-router-dom';
import { ClientPayTypesManager } from '../components/ClientPayTypesManager';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

export const ClientPayTypesPage = () => {
  const { companyId } = useParams<{ companyId: string }>();

  if (!companyId) {
    return <div>Company ID required</div>;
  }

  return (
    <StandardPageLayout
      title="Client Pay Types"
      subtitle="Manage earnings and deduction types for this client"
    >
      <ClientPayTypesManager companyId={companyId} />
    </StandardPageLayout>
  );
};