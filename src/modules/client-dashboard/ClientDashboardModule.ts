import React from 'react';
import { HaaLOModule, ModuleMetadata, ModuleRoute } from '../core/ModuleLoader';
import { ClientDashboard } from '@/pages/ClientDashboard';
// Client dashboard functionality - using UnifiedLayout

const metadata: ModuleMetadata = {
  id: 'client-dashboard',
  name: 'Client Dashboard',
  description: 'Comprehensive dashboard for client administrators with modular KPI widgets',
  version: '1.0.0',
  icon: 'building2',
  category: 'core',
  isPremium: false,
  isBeta: false,
  isComingSoon: false,
  requiredSetup: false,
  status: 'active',
  statusColor: 'green'
};

const routes: ModuleRoute[] = [
  {
    path: '/client-dashboard',
    component: ClientDashboard,
    exact: true,
    protected: true,
    roles: ['company_admin']
  }
];

export const ClientDashboardModule: HaaLOModule = {
  metadata,
  routes,
  menu: [
    {
      id: 'client-dashboard',
      label: 'Dashboard',
      icon: 'building2',
      path: '/client-dashboard',
      requiredRoles: ['company_admin']
    }
  ]
};