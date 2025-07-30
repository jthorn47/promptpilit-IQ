import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

// Lazy load ConnectIQ CRM components
const Dashboard = lazy(() => import('@/modules/connectiq/Dashboard'));
const Companies = lazy(() => import('@/modules/connectiq/Companies'));
const CompanyDetails = lazy(() => import('@/domains/crm/pages/CompanyDetails'));
const Contacts = lazy(() => import('@/modules/connectiq/Contacts'));
const Opportunities = lazy(() => import('@/modules/connectiq/Opportunities'));
const Activities = lazy(() => import('@/modules/connectiq/Activities'));
const Tags = lazy(() => import('@/modules/connectiq/Tags'));
const Notes = lazy(() => import('@/modules/connectiq/Notes'));
const CustomFields = lazy(() => import('@/modules/connectiq/CustomFields'));
const Pipelines = lazy(() => import('@/modules/connectiq/Pipelines'));
const ClientContracts = lazy(() => import('@/modules/connectiq/ClientContracts'));
const Attachments = lazy(() => import('@/modules/connectiq/Attachments'));
const CommunicationsLog = lazy(() => import('@/modules/connectiq/CommunicationsLog'));
const DealValueReporting = lazy(() => import('@/modules/connectiq/DealValueReporting'));
const LeadSourceAttribution = lazy(() => import('@/modules/connectiq/LeadSourceAttribution'));
const EmailTemplates = lazy(() => import('@/modules/connectiq/EmailTemplates'));

export const connectIQRoutes: ModuleRoute[] = [
  {
    path: '/admin/connectiq/dashboard',
    component: Dashboard,
    exact: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/admin/connectiq/companies',
    component: Companies,
    exact: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/admin/connectiq/companies/:companyId',
    component: CompanyDetails,
    exact: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/admin/connectiq/companies/edit/:id',
    component: Companies,
    exact: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/admin/connectiq/contacts',
    component: Contacts,
    exact: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/admin/connectiq/opportunities',
    component: Opportunities,
    exact: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/admin/connectiq/activities',
    component: Activities,
    exact: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/admin/connectiq/tags',
    component: Tags,
    exact: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/admin/connectiq/notes',
    component: Notes,
    exact: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/admin/connectiq/custom-fields',
    component: CustomFields,
    exact: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/admin/connectiq/pipelines',
    component: Pipelines,
    exact: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/admin/connectiq/contracts',
    component: ClientContracts,
    exact: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/admin/connectiq/attachments',
    component: Attachments,
    exact: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/admin/connectiq/communications',
    component: CommunicationsLog,
    exact: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/admin/connectiq/reporting',
    component: DealValueReporting,
    exact: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/admin/connectiq/lead-sources',
    component: LeadSourceAttribution,
    exact: true,
    roles: ['super_admin', 'company_admin']
  },
  {
    path: '/admin/connectiq/email-templates',
    component: EmailTemplates,
    exact: true,
    roles: ['super_admin', 'company_admin']
  }
];