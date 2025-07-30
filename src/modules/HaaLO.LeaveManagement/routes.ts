import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

// Lazy load Leave Management components
const LeaveManagementDashboard = lazy(() => import('./components/LeaveManagementDashboard').then(m => ({ default: m.LeaveManagementDashboard })));
const LeaveRequests = lazy(() => import('./components/LeaveRequests').then(m => ({ default: m.LeaveRequests })));
const LeaveCalendar = lazy(() => import('./components/LeaveCalendar').then(m => ({ default: m.LeaveCalendar })));
const LeaveApprovals = lazy(() => import('./components/LeaveApprovals').then(m => ({ default: m.LeaveApprovals })));
const LeaveManagementConfig = lazy(() => import('./components/LeaveManagementConfig').then(m => ({ default: m.LeaveManagementConfig })));

export const leaveManagementRoutes: ModuleRoute[] = [
  {
    path: '/admin/leave-management',
    component: LeaveManagementDashboard,
    exact: true,
    roles: ['admin', 'super_admin', 'hr_manager']
  },
  {
    path: '/admin/leave-management/requests',
    component: LeaveRequests,
    roles: ['admin', 'super_admin', 'hr_manager']
  },
  {
    path: '/admin/leave-management/calendar',
    component: LeaveCalendar,
    roles: ['admin', 'super_admin', 'hr_manager']
  },
  {
    path: '/admin/leave-management/approvals',
    component: LeaveApprovals,
    roles: ['admin', 'super_admin', 'hr_manager']
  },
  {
    path: '/admin/leave-management/config',
    component: LeaveManagementConfig,
    roles: ['admin', 'super_admin']
  }
];