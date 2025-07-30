import React from 'react';
import { GamificationDashboard } from '@/components/GamificationDashboard';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

export const GamificationPage = () => {
  return (
    <StandardPageLayout
      title="Gamification & Engagement"
      subtitle="Manage points, badges, leaderboards, and engagement features"
    >
      <GamificationDashboard />
    </StandardPageLayout>
  );
};

export default GamificationPage;