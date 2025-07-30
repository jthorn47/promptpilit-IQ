
import { RegisterModule } from '../core/ModuleLoader';
import LaunchpadLayout from './components/LaunchpadLayout';

// Register the SuperAdmin Launchpad module
RegisterModule({
  metadata: {
    id: 'superadmin-launchpad',
    name: 'SuperAdmin Launchpad',
    version: '1.0.0',
    description: 'Master control center for system-wide visibility and operations',
    icon: 'Crown',
    category: 'core',
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
      path: '/superadmin/launchpad',
      component: LaunchpadLayout,
      exact: true,
      protected: true,
      roles: ['super_admin']
    },
    {
      path: '/dashboard',
      component: LaunchpadLayout,
      exact: true,
      protected: true,
      roles: ['super_admin']
    }
  ],
  menu: [
    {
      id: 'superadmin-launchpad',
      label: 'Launchpad',
      icon: 'Crown',
      path: '/superadmin/launchpad',
      requiredRoles: ['super_admin']
    }
  ]
});

export default LaunchpadLayout;
