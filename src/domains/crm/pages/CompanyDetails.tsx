import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { CompanyProfileView } from '@/modules/HaaLO.CRM/components/CompanyProfileView';

export default function CompanyDetails() {
  const { companyId } = useParams<{ companyId: string }>();

  if (!companyId) {
    return <Navigate to="/admin/connectiq/companies" replace />;
  }

  return (
    <StandardPageLayout 
      title="Company Profile"
      subtitle="View and manage company details"
    >
      <CompanyProfileView />
    </StandardPageLayout>
  );
}