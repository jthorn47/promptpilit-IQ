import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { ActivitiesManager } from '@/modules/HaaLO.CRM/components/ActivitiesManager';

const Activities = () => {
  return (
    <StandardPageLayout 
      title="Activities"
      subtitle="Manage tasks, calls, and notes"
    >
      <ActivitiesManager />
    </StandardPageLayout>
  );
};

export default Activities;