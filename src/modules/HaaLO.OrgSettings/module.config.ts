import { ModuleMetadata } from '../core/ModuleLoader';

export const moduleConfig: ModuleMetadata = {
  id: 'org-settings',
  name: 'Organization Settings',
  description: 'Manage company contact info, branding, and default pay settings.',
  version: '1.0.0',
  icon: 'Settings',
  category: 'core',
  isPremium: false,
  isBeta: false,
  isComingSoon: false,
  requiredSetup: false,
  dependencies: [],
  status: 'active',
  statusColor: 'bg-green-100 text-green-800'
};