import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

// Lazy load Time Tracking components
const TimeTrackingDashboard = lazy(() => import('./components/TimeTrackingDashboard').then(m => ({ default: m.TimeTrackingDashboard })));
const TimesheetManagement = lazy(() => import('./components/TimesheetManagement').then(m => ({ default: m.TimesheetManagement })));
const TimeEntries = lazy(() => import('./components/TimeEntries').then(m => ({ default: m.TimeEntries })));
const ProjectTracking = lazy(() => import('./components/ProjectTracking').then(m => ({ default: m.ProjectTracking })));
const TimeReports = lazy(() => import('./components/TimeReports').then(m => ({ default: m.TimeReports })));
const TimeApprovals = lazy(() => import('./components/TimeApprovals').then(m => ({ default: m.TimeApprovals })));
const TimeTrackingConfig = lazy(() => import('./components/TimeTrackingConfig').then(m => ({ default: m.TimeTrackingConfig })));

export const timeTrackingRoutes: ModuleRoute[] = [
  {
    path: '/admin/time-tracking',
    component: TimeTrackingDashboard,
    exact: true,
    roles: ['admin', 'super_admin', 'hr_manager']
  },
  {
    path: '/admin/time-tracking/timesheets',
    component: TimesheetManagement,
    roles: ['admin', 'super_admin', 'hr_manager']
  },
  {
    path: '/admin/time-tracking/entries',
    component: TimeEntries,
    roles: ['admin', 'super_admin', 'hr_manager']
  },
  {
    path: '/admin/time-tracking/projects',
    component: ProjectTracking,
    roles: ['admin', 'super_admin', 'hr_manager']
  },
  {
    path: '/admin/time-tracking/reports',
    component: TimeReports,
    roles: ['admin', 'super_admin']
  },
  {
    path: '/admin/time-tracking/approvals',
    component: TimeApprovals,
    roles: ['admin', 'super_admin', 'hr_manager']
  },
  {
    path: '/admin/time-tracking/config',
    component: TimeTrackingConfig,
    roles: ['admin', 'super_admin']
  }
];