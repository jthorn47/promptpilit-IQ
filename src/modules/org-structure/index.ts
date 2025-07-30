// Export organizational structure module components
export { OrgStructurePage } from './pages/OrgStructurePage';
export { ClientOrgStructurePage } from './pages/ClientOrgStructurePage';

// Re-export the main hook
export { useOrgStructure } from '@/hooks/useOrgStructure';

// Re-export types
export type { 
  Location, 
  Division, 
  Department, 
  OrgAssignment,
  CompanyOrgSettings 
} from '@/hooks/useOrgStructure';