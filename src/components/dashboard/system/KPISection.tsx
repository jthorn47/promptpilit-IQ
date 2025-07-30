
import React from 'react';
import { ActiveClientsKPI } from './kpi/ActiveClientsKPI';
import { SystemUptimeKPI } from './kpi/SystemUptimeKPI';
import { SupportTicketsKPI } from './kpi/SupportTicketsKPI';
import { ComplianceAlertsKPI } from './kpi/ComplianceAlertsKPI';
import { NewClientsKPI } from './kpi/NewClientsKPI';

export const KPISection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
      <ActiveClientsKPI />
      <SystemUptimeKPI />
      <SupportTicketsKPI />
      <ComplianceAlertsKPI />
      <NewClientsKPI />
    </div>
  );
};
