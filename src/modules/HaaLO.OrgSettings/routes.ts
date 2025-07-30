import { ModuleRoute } from '../core/ModuleLoader';
import { OrgSettingsConfig } from './components/OrgSettingsConfig';

export const routes: ModuleRoute[] = [
  {
    path: '/org-settings',
    component: OrgSettingsConfig,
    exact: true,
    protected: true,
    roles: ['company_admin', 'super_admin']
  }
];