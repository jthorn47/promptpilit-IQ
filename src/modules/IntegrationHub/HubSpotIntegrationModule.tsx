/**
 * @fileoverview HubSpot Integration Module
 * @module HubSpotIntegrationModule  
 * @author Lovable AI
 * @version 1.0.0
 */

import React from 'react';
import { HaaLOModule, ModuleMetadata, ModuleRoute } from '../core/ModuleLoader';
import { HubSpotImportPage } from '@/pages/HubSpotImportPage';
import { Database } from 'lucide-react';

// Module metadata
const metadata: ModuleMetadata = {
  id: 'hubspot-integration',
  name: 'HubSpot Integration',
  description: 'Import and sync data from HubSpot CRM including contacts, companies, and deals',
  version: '1.0.0',
  icon: 'Database',
  category: 'core',
  isPremium: false,
  isBeta: false,
  isComingSoon: false,
  requiredSetup: true,
  status: 'active',
  statusColor: 'green'
};

// Module routes
const routes: ModuleRoute[] = [
  {
    path: '/admin/integrations/hubspot',
    component: HubSpotImportPage,
    exact: true,
    protected: true,
    roles: ['admin', 'super_admin']
  }
];

// Menu items
const menu = [
  {
    id: 'hubspot-integration',
    label: 'HubSpot Integration',
    icon: 'Database',
    path: '/admin/integrations/hubspot',
    requiredRoles: ['admin', 'super_admin']
  }
];

// Module definition
export const HubSpotIntegrationModule: HaaLOModule = {
  metadata,
  routes,
  menu,
  
  initialize: async (config) => {
    console.log('🔗 Initializing HubSpot Integration Module...');
    // Any initialization logic here
    return Promise.resolve();
  },

  destroy: async () => {
    console.log('🔗 Destroying HubSpot Integration Module...');
    return Promise.resolve();
  },

  getComponent: () => HubSpotImportPage
};