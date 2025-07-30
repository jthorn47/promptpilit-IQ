import React from 'react';
import { ClientJobTitles } from '@/modules/jobtitles';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

const ClientJobTitlesPage: React.FC = () => {
  return (
    <StandardPageLayout
      title="Job Titles"
      subtitle="Manage your company's job titles and descriptions"
    >
      <ClientJobTitles />
    </StandardPageLayout>
  );
};

export default ClientJobTitlesPage;