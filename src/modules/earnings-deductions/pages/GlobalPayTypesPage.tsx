import React from 'react';
import { GlobalPayTypes } from '../components/GlobalPayTypes';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

export const GlobalPayTypesPage = () => {
  return (
    <StandardPageLayout
      title="Global Pay Types"
      subtitle="Manage standard earnings and deduction types for all clients"
    >
      <GlobalPayTypes />
    </StandardPageLayout>
  );
};