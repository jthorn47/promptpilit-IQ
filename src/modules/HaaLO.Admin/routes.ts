import { ModuleRoute } from '../core/ModuleLoader';
import { lazy } from 'react';

// Lazy load admin components
const Admin = lazy(() => import('../../pages/Admin'));
const RolesPermissions = lazy(() => import('../../pages/admin/RolesPermissions'));
const ContactSearchPage = lazy(() => import('../../pages/admin/ContactSearchPage'));
const ModulesPage = lazy(() => import('../../pages/admin/ModulesPage'));
const SystemSettings = lazy(() => import('../../pages/admin/SystemSettings'));
const StripeDashboard = lazy(() => import('../../pages/admin/StripeDashboard'));
const UsersPage = lazy(() => import('../../pages/admin/UsersPage'));

export const adminRoutes: ModuleRoute[] = [
  {
    path: '/admin',
    component: Admin,
    protected: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/admin/users',
    component: UsersPage,
    protected: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/admin/roles-permissions',
    component: RolesPermissions,
    protected: true,
    roles: ['super_admin']
  },
  {
    path: '/admin/contact-search',
    component: ContactSearchPage,
    protected: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/admin/modules',
    component: ModulesPage,
    protected: true,
    roles: ['super_admin']
  },
  {
    path: '/admin/settings',
    component: SystemSettings,
    protected: true,
    roles: ['super_admin']
  },
  {
    path: '/admin/stripe',
    component: StripeDashboard,
    protected: true,
    roles: ['super_admin']
  }
];