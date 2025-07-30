import React from 'react';
import { ParentModuleApp } from '@/components/ui/parent-module-app';
import { Building2 } from 'lucide-react';

// Client Management children modules
const clientManagementChildren = [
  {
    id: 'client-directory',
    title: 'Client Directory',
    description: 'View and manage all client accounts',
    url: '/client-management/list',
    icon: Building2,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'client-onboarding',
    title: 'Client Onboarding',
    description: 'Streamlined client setup and configuration',
    url: '/client-management/onboarding',
    icon: Building2,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'client-settings',
    title: 'Client Settings',
    description: 'Configure client-specific settings and preferences',
    url: '/client-management/settings',
    icon: Building2,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'client-billing',
    title: 'Client Billing',
    description: 'Manage client contracts and billing information',
    url: '/client-management/billing',
    icon: Building2,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'client-communication',
    title: 'Communication Hub',
    description: 'Client communication and support center',
    url: '/client-management/communication',
    icon: Building2,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'client-analytics',
    title: 'Client Analytics',
    description: 'Client performance metrics and reporting',
    url: '/client-management/analytics',
    icon: Building2,
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'client-support',
    title: 'Support & Help Desk',
    description: 'Client support ticket management',
    url: '/client-management/support',
    icon: Building2,
    roles: ['super_admin', 'company_admin', 'client_admin']
  }
];

export const ClientManagementApp: React.FC = () => {
  return (
    <ParentModuleApp
      title="Client Management"
      description="Comprehensive client lifecycle management"
      icon={Building2}
      children={clientManagementChildren}
    />
  );
};