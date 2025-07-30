
import React from 'react';
import { SystemHealthMonitor } from './monitoring/SystemHealthMonitor';
import { BackgroundJobFailures } from './monitoring/BackgroundJobFailures';
import { AuditLogFeed } from './monitoring/AuditLogFeed';

export const SystemMonitoringSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
      <SystemHealthMonitor />
      <BackgroundJobFailures />
      <AuditLogFeed />
    </div>
  );
};
