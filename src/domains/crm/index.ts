// CRM Domain - Main export
// Note: Router was removed during consolidation

// Component exports
export { ActivitiesManager } from './components/ActivitiesManager';
export { LeadsManager } from './components/LeadsManager';
export { DealsManager } from './components/DealsManager';
export { default as ClientsManager } from './components/ClientsManager';
export { ContactsManager } from './components/ContactsManager';
export { GlobalContactsManager } from './components/contacts/GlobalContactsManager';
export { CRMDashboard } from './components/CRMDashboard';

// API exports
export { crmAPI } from './api';

// Page exports
export { default as CRM } from './pages/CRM';

// Hook exports
export * from './hooks';

// Type exports
export * from './types';