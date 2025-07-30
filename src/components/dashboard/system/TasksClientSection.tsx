
import React from 'react';
import { OnboardingProgressTracker } from './tasks/OnboardingProgressTracker';
import { NotificationCenter } from './tasks/NotificationCenter';
import { ScheduledDeployments } from './tasks/ScheduledDeployments';

export const TasksClientSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
      <OnboardingProgressTracker />
      <NotificationCenter />
      <ScheduledDeployments />
    </div>
  );
};
