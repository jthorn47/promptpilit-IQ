import { ModuleRoute } from '@/modules/core/ModuleLoader';
import SimpleCRMDashboard from './components/SimpleCRMDashboard';
import DealsPage from '@/domains/crm/pages/DealsPage';
import LeadsPage from '@/domains/crm/pages/LeadsPage';
import ContactsPage from '@/domains/crm/pages/ContactsPage';
import ActivitiesPage from '@/domains/crm/pages/ActivitiesPage';
import Pipeline from '@/domains/crm/pages/Pipeline';
import { NavigatorView } from '@/domains/crm/components/NavigatorView';
import AssessmentsPage from '@/domains/crm/pages/AssessmentsPage';
import ProposalsPage from '@/domains/crm/pages/ProposalsPage';
import EmailCampaignsPage from '@/domains/crm/pages/EmailCampaignsPage';
import ForecastingPage from '@/domains/crm/pages/ForecastingPage';
import SettingsPage from '@/domains/crm/pages/SettingsPage';
import AutomationsPage from '@/domains/crm/pages/AutomationsPage';
import { CRMInboxPage } from '@/components/inbox/CRMInboxPage';

export const crmRoutes: ModuleRoute[] = [
  {
    path: '/admin/crm',
    component: SimpleCRMDashboard,
    exact: true,
    roles: ['admin', 'super_admin']
  },
  {
    path: '/admin/crm/dashboard',
    component: SimpleCRMDashboard,
    roles: ['admin', 'super_admin']
  },
  {
    path: '/admin/crm/deals',
    component: DealsPage,
    exact: true,
    roles: ['admin', 'super_admin']
  },
  {
    path: '/admin/crm/companies',
    component: ContactsPage,
    exact: true,
    roles: ['admin', 'super_admin']
  },
  {
    path: '/admin/crm/contacts',
    component: ContactsPage,
    exact: true,
    roles: ['admin', 'super_admin']
  },
  {
    path: '/admin/crm/leads',
    component: LeadsPage,
    roles: ['admin', 'super_admin']
  },
  {
    path: '/admin/crm/activities',
    component: ActivitiesPage,
    roles: ['admin', 'super_admin']
  },
  {
    path: '/admin/crm/pipeline',
    component: Pipeline,
    roles: ['admin', 'super_admin']
  },
  {
    path: '/admin/crm/navigator',
    component: NavigatorView,
    roles: ['admin', 'super_admin']
  },
  {
    path: '/admin/crm/assessments',
    component: AssessmentsPage,
    roles: ['admin', 'super_admin']
  },
  {
    path: '/admin/crm/proposals',
    component: ProposalsPage,
    roles: ['admin', 'super_admin']
  },
  {
    path: '/admin/crm/email-campaigns',
    component: EmailCampaignsPage,
    roles: ['admin', 'super_admin']
  },
  {
    path: '/admin/crm/forecasting',
    component: ForecastingPage,
    roles: ['admin', 'super_admin']
  },
  {
    path: '/admin/crm/settings',
    component: SettingsPage,
    roles: ['admin', 'super_admin']
  },
  {
    path: '/admin/crm/automations',
    component: AutomationsPage,
    roles: ['admin', 'super_admin']
  },
  {
    path: '/admin/crm/email-client',
    component: CRMInboxPage,
    exact: true,
    roles: ['admin', 'super_admin']
  }
];