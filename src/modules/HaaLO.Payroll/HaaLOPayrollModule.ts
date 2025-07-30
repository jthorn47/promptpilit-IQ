/**
 * HaaLO Payroll Module
 * Comprehensive payroll management system
 */

import React from 'react';
import { HaaLOModule, ModuleRoute } from '../core/ModuleLoader';


// Direct component imports without extra wrapping
const PayrollManagerComponent = () => {
  const PayrollManager = React.lazy(() => import('@/domains/payroll/pages/PayrollManager'));
  return React.createElement(PayrollManager);
};

const PayrollSettingsComponent = () => {
  const PayrollSettingsPage = React.lazy(() => import('@/pages/payroll/PayrollSettingsPage').then(m => ({ default: m.PayrollSettingsPage })));
  return React.createElement(PayrollSettingsPage);
};

const PayrollEarningsDeductionsComponent = () => {
  const PayrollEarningsDeductionsPage = React.lazy(() => import('@/pages/payroll/PayrollEarningsDeductionsPage').then(m => ({ default: m.PayrollEarningsDeductionsPage })));
  return React.createElement(PayrollEarningsDeductionsPage);
};

const PayrollBasicSettingsComponent = () => {
  const PayrollBasicSettingsPage = React.lazy(() => import('@/pages/payroll/PayrollBasicSettingsPage').then(m => ({ default: m.PayrollBasicSettingsPage })));
  return React.createElement(PayrollBasicSettingsPage);
};

const PayrollTaxConfigComponent = () => {
  const PayrollTaxConfigPage = React.lazy(() => import('@/pages/payroll/PayrollTaxConfigPage').then(m => ({ default: m.PayrollTaxConfigPage })));
  return React.createElement(PayrollTaxConfigPage);
};

const PayrollReportsComponent = () => {
  const PayrollReportsPage = React.lazy(() => import('@/pages/PayrollReportsPage').then(m => ({ default: m.PayrollReportsPage })));
  return React.createElement(PayrollReportsPage);
};

// Create module routes
const createModuleRoutes = (): ModuleRoute[] => {
  return [
    {
      path: '/admin/payroll/dashboard',
      component: PayrollManagerComponent,
      roles: ['super_admin', 'company_admin', 'payroll_admin']
    },
    {
      path: '/admin/payroll/settings',
      component: PayrollSettingsComponent,
      roles: ['super_admin', 'company_admin', 'payroll_admin']
    },
    {
      path: '/admin/payroll/settings/deductions',
      component: PayrollEarningsDeductionsComponent,
      roles: ['super_admin', 'company_admin', 'payroll_admin']
    },
    {
      path: '/admin/payroll/settings/earnings',
      component: PayrollEarningsDeductionsComponent,
      roles: ['super_admin', 'company_admin', 'payroll_admin']
    },
    {
      path: '/admin/payroll/settings/basic',
      component: PayrollBasicSettingsComponent,
      roles: ['super_admin', 'company_admin', 'payroll_admin']
    },
    {
      path: '/admin/payroll/settings/tax',
      component: PayrollTaxConfigComponent,
      roles: ['super_admin', 'company_admin', 'payroll_admin']
    },
    {
      path: '/admin/payroll/reports/payroll',
      component: PayrollReportsComponent,
      roles: ['super_admin', 'company_admin', 'payroll_admin']
    }
  ];
};

export const HaaLOPayrollModule: HaaLOModule = {
  metadata: {
    id: 'haalo-payroll',
    name: 'HaaLO Payroll',
    description: 'Comprehensive payroll management and processing system',
    version: '1.0.0',
    icon: 'DollarSign',
    category: 'finance',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: createModuleRoutes(),
  menu: [
    {
      id: 'payroll-dashboard',
      label: 'Payroll Dashboard',
      path: '/admin/payroll/dashboard',
      requiredRoles: ['super_admin', 'company_admin', 'payroll_admin']
    },
    {
      id: 'payroll-settings',
      label: 'Payroll Settings',
      path: '/admin/payroll/settings',
      requiredRoles: ['super_admin', 'company_admin', 'payroll_admin']
    },
    {
      id: 'payroll-reports',
      label: 'Payroll Reports',
      path: '/admin/payroll/reports/payroll',
      requiredRoles: ['super_admin', 'company_admin', 'payroll_admin']
    }
  ],
  initialize: async (config) => {
    console.log('🚀 HaaLO Payroll module initialized');
  }
};