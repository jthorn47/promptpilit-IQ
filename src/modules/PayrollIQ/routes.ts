import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

// Lazy load Payroll IQ components  
const PayrollProcessingPage = lazy(() => import('../../pages/payroll-iq/PayrollProcessingPage').then(m => ({ default: m.PayrollProcessingPage })));
const TaxManagementPage = lazy(() => import('../../pages/payroll-iq/TaxManagementPage').then(m => ({ default: m.TaxManagementPage })));

export const payrollIQRoutes: ModuleRoute[] = [
  {
    path: '/payroll-iq/processing',
    component: PayrollProcessingPage,
    exact: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/payroll-iq/taxes',
    component: TaxManagementPage,
    exact: true,
    roles: ['super_admin', 'company_admin']
  }
];