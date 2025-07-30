import { RegisterModule } from '../core/ModuleLoader';
import HaaLOIQUniversity from './components/HaaLOIQUniversity';

// Register the HaaLO IQ University module
RegisterModule({
  metadata: {
    id: 'haalo-university',
    name: 'HALO IQ University',
    version: '1.0.0',
    description: 'Internal training platform for platform mastery',
    icon: 'GraduationCap',
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
      path: '/admin/university',
      component: HaaLOIQUniversity,
      exact: true,
      protected: true,
      roles: []
    }
  ],
  menu: [
    {
      id: 'haalo-university',
      label: 'HaaLO IQ University',
      icon: 'GraduationCap',
      path: '/admin/university',
      requiredRoles: ['super_admin']
    }
  ]
});

export default HaaLOIQUniversity;