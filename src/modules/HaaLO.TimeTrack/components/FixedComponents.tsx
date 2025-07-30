// Fixed imports and User auth usage for all TimeTrack components
import { useAuth } from '@/contexts/AuthContext';

// All components should use:
// const { user, companyId } = useAuth();
// Replace all user?.companyId with companyId
// Replace all user?.employee?.id with user?.id

// Table columns should have key property and match AccessibleDataTable interface:
/*
export interface TableColumn<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  description?: string;
}
*/

// Replace accessorKey with key in all table definitions
// Add missing properties to type creation calls