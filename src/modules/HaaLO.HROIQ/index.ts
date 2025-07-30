import React from 'react';
import { RegisterModule } from '../core/ModuleLoader';
import HROIQLayout from './components/HROIQLayout';
import HROIQDashboardRoute from './components/routes/HROIQDashboardRoute';
import HROIQServiceLogRoute from './components/routes/HROIQServiceLogRoute';
import HROIQEmployeesRoute from './components/routes/HROIQEmployeesRoute';
import HROIQOnboardingRoute from './components/routes/HROIQOnboardingRoute';
import HROIQPoliciesRoute from './components/routes/HROIQPoliciesRoute';
import HROIQComplianceRoute from './components/routes/HROIQComplianceRoute';
import HROIQAskExpertRoute from './components/routes/HROIQAskExpertRoute';
import HROIQClientRoute from './components/routes/HROIQClientRoute';
import HROIQSettingsRoute from './components/routes/HROIQSettingsRoute';
import HROIQDeliverablesRoute from './components/routes/HROIQDeliverablesRoute';
import HROIQLMSTrackerRoute from './components/routes/HROIQLMSTrackerRoute';

console.log('🔍 HRO IQ Module: Starting registration');

// Register the HROIQ module
console.log('🔍 HRO IQ Module: About to register module with routes:', [
  '/admin/hro-iq',
  '/admin/hro-iq/dashboard', 
  '/admin/hro-iq/service-log',
  '/admin/hro-iq/employees'
]);

const hroiqModule = RegisterModule({
  metadata: {
    id: 'haalo-hroiq',
    name: 'HRO IQ',
    version: '1.0.0',
    description: 'Human Resource Outsourcing Intelligence - Complete HR service management platform',
    icon: 'Briefcase',
    category: 'hr',
    status: 'active',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    statusColor: 'green',
    dependencies: []
  },
  routes: [
    {
      path: '/admin/hro-iq',
      component: HROIQLayout,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/hro-iq/dashboard',
      component: HROIQDashboardRoute,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/hro-iq/service-log',
      component: HROIQServiceLogRoute,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/hro-iq/client',
      component: HROIQClientRoute,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/hro-iq/onboarding',
      component: HROIQOnboardingRoute,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/hro-iq/employees',
      component: HROIQEmployeesRoute,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/hro-iq/policies',
      component: HROIQPoliciesRoute,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/hro-iq/compliance',
      component: HROIQComplianceRoute,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/hro-iq/ask-expert',
      component: HROIQAskExpertRoute,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/hro-iq/settings',
      component: HROIQSettingsRoute,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/hro-iq/deliverables',
      component: HROIQDeliverablesRoute,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/hro-iq/lms-tracker',
      component: HROIQLMSTrackerRoute,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    }
  ],
  menu: [
    {
      id: 'hroiq-dashboard',
      label: 'HRO IQ',
      icon: 'Briefcase',
      path: '/admin/hro-iq',
      requiredRoles: ['super_admin', 'company_admin', 'client_admin']
    }
  ]
});

console.log('🔍 HRO IQ Module: Registration complete!', hroiqModule);

export default HROIQLayout;