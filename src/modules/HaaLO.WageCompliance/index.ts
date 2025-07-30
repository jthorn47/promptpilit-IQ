/**
 * HaaLO.WageCompliance Module
 * Wage & Hour Compliance Center for federal, state, and local law compliance
 */

import React from 'react';
import { RegisterModule } from '../core/ModuleLoader';
import { WageComplianceDashboard } from './components/WageComplianceDashboard';

// Register the module
const WageComplianceModule = RegisterModule({
  metadata: {
    id: 'haalo-wage-compliance',
    name: 'HaaLO.WageCompliance',
    description: 'Wage & Hour Compliance Center for federal, state, and local law compliance',
    version: '1.0.0',
    icon: 'scale',
    category: 'hr',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: '#10B981',
  },
  routes: [
    {
      path: '/admin/compliance/wage',
      component: WageComplianceDashboard,
      exact: true,
      protected: true,
      roles: ['admin', 'super_admin'],
    },
  ],
  menu: [
    {
      id: 'wage-compliance',
      label: 'Wage & Hour Compliance',
      icon: 'scale',
      path: '/admin/compliance/wage',
      requiredRoles: ['admin', 'super_admin'],
    },
  ],
  services: {},
  configuration: {
    tenantScoped: true,
    auditingEnabled: true,
    defaultSettings: {
      enableMinWageTracking: true,
      enableOvertimeAlerts: true,
      enableBreakTracking: true,
      enableFLSAChecks: true,
    },
  },
});

export default WageComplianceModule;