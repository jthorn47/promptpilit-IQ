// CRM Domain Hooks - Modern CRM hooks (primary)
export { useCrmOpportunities, useCrmOpportunity, useCrmOpportunityMutations } from './useCrmOpportunities';
export { useCrmCompanies, useCrmCompany, useCrmCompanyMutations } from './useCrmCompanies';
export { useCrmContacts } from './useCrmContacts';
export { useCrmTasks, useCrmTask, useCrmTaskMutations } from './useCrmTasks';
export { useCrmSpinContents, useCrmSpinContent, useCrmSpinContentByOpportunity, useCrmSpinContentMutations } from './useCrmSpinContents';

// Legacy CRM hooks (for backward compatibility)
export { useLeads } from './useLeads';
export { useDeals } from './useDeals';
export { useActivities } from './useActivities';
export { useContacts } from './useContacts';
export { useCRMMetrics } from './useCRMMetrics';
export { useSalesFunnel } from './useSalesFunnel';
export { useEmailTemplates } from './useEmailTemplates';
export { useEmailCampaigns } from './useEmailCampaigns';
export { useCompanyContacts } from './useCompanyContacts';
export { useCompanyContactMutation } from './useCompanyContactMutation';
export { useGlobalContacts, useContactFilterOptions } from './useGlobalContacts';
export { useContactMutations } from './useContactMutations';
export { useContactProfile } from './useContactProfile';
export { useContactPermissions, useCanAccessCompany } from './useContactPermissions';
export { useCRMNotifications } from './useCRMNotifications';