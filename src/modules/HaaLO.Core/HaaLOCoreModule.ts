import { HaaLOModule, ModuleMetadata, ModuleRoute } from '../core/ModuleLoader';
import { ModuleRenderer } from '../core/ModuleRenderer';

const metadata: ModuleMetadata = {
  id: 'haalo-core',
  name: 'HaaLO IQ',
  description: 'Core HaaLO Intelligence Platform with modular capabilities',
  version: '1.0.0',
  icon: 'Settings',
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
    path: '/haalo-iq',
    component: ModuleRenderer,
    exact: true,
    protected: true,
    roles: ['company_admin']
  }
];

export const HaaLOCoreModule: HaaLOModule = {
  metadata,
  routes,
  menu: [
    {
      id: 'haalo-iq',
      label: 'HaaLO IQ',
      icon: 'Settings',
      path: '/haalo-iq',
      requiredRoles: ['company_admin'],
      children: [
        {
          id: 'finance-iq',
          label: 'Finance IQ',
          icon: 'DollarSign',
          path: '/finance-iq',
          requiredRoles: ['company_admin', 'finance_admin']
        }
      ]
    }
  ],
  getComponent: () => ModuleRenderer
};