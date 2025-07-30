import React from 'react';
import type { HaaLOModule } from '../core/ModuleLoader';
import { TimeTrackAdminDashboard } from './components/TimeTrackAdminDashboard';
import { MyTimePage } from './components/MyTimePage';
import { TeamTimePage } from './components/TeamTimePage';
import { WeeklySummaryPage } from './components/WeeklySummaryPage';
import { TimeReportsPage } from './components/TimeReportsPage';
import { TimeSettingsPage } from './components/TimeSettingsPage';

const timeTrackModule: HaaLOModule = {
  metadata: {
    id: 'haalo.timetrack',
    name: 'TimeTrack',
    description: 'Enterprise time tracking with GPS verification and project-based billing',
    version: '1.0.0',
    icon: 'Clock',
    category: 'premium',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: [
    {
      path: '/halo/time',
      component: TimeTrackAdminDashboard,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/halo/time/my',
      component: MyTimePage,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/halo/time/team',
      component: TeamTimePage,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/halo/time/summary',
      component: WeeklySummaryPage,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/halo/time/reports',
      component: TimeReportsPage,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/halo/time/settings',
      component: TimeSettingsPage,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    }
  ],
  menu: [
    {
      id: 'timetrack',
      label: 'Time Track',
      icon: 'Clock',
      path: '/halo/time',
      requiredRoles: ['super_admin', 'company_admin'],
      children: [
        {
          id: 'my-time',
          label: 'My Time',
          icon: 'Clock',
          path: '/halo/time/my',
          requiredRoles: ['super_admin', 'company_admin']
        },
        {
          id: 'team-time',
          label: 'Team Time',
          icon: 'Users',
          path: '/halo/time/team',
          requiredRoles: ['super_admin', 'company_admin']
        },
        {
          id: 'weekly-summary',
          label: 'Weekly Summary',
          icon: 'Calendar',
          path: '/halo/time/summary',
          requiredRoles: ['super_admin', 'company_admin']
        },
        {
          id: 'time-reports',
          label: 'Reports',
          icon: 'BarChart3',
          path: '/halo/time/reports',
          requiredRoles: ['super_admin', 'company_admin']
        },
        {
          id: 'time-settings',
          label: 'Settings',
          icon: 'Settings',
          path: '/halo/time/settings',
          requiredRoles: ['super_admin', 'company_admin']
        }
      ]
    }
  ],
  initialize: async (config) => {
    console.log('🕒 Initializing HaaLO.TimeTrack module:', config);
  },
  destroy: async () => {
    console.log('🕒 Destroying HaaLO.TimeTrack module');
  }
};

console.log('🔍 TimeTrack: Registering module...');
console.log('🔍 TimeTrack: Module details:', {
  id: 'haalo.timetrack',
  routes: [{
    path: '/halo/time',
    component: 'TimeTrackComponent'
  }]
});

// Export as named export to avoid ES module conflicts
export { timeTrackModule as HaaLOTimeTrackModule };