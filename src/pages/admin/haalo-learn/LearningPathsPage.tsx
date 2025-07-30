import React from 'react';
import { LearningPathsManager } from '@/components/LearningPathsManager';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

export const LearningPathsPage = () => {
  return (
    <StandardPageLayout
      title="Learning Paths"
      subtitle="Create and manage personalized learning journeys"
    >
      <LearningPathsManager />
    </StandardPageLayout>
  );
};

export default LearningPathsPage;