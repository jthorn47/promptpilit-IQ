import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SearchResult {
  id: string;
  type: 'company' | 'employee' | 'proposal' | 'lead' | 'deal' | 'module' | 'dashboard';
  title: string;
  description?: string;
  url: string;
  badge?: string;
  external?: boolean;
}

// Navigation modules that can be searched
const navigationModules = [
  {
    id: 'dashboard',
    type: 'module' as const,
    title: 'Dashboard',
    description: 'Main dashboard and overview',
    url: '/admin/dashboard',
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'my-work',
    type: 'module' as const,
    title: 'My Work',
    description: 'Personal tasks and assignments',
    url: '/admin/my-work',
    roles: ['all']
  },
  {
    id: 'companies',
    type: 'module' as const,
    title: 'Companies',
    description: 'Company management and records',
    url: '/admin/companies',
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'proposals',
    type: 'module' as const,
    title: 'Proposals',
    description: 'Proposal management system',
    url: '/admin/proposals',
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'vault',
    type: 'module' as const,
    title: 'Vault',
    description: 'Document storage and management',
    url: '/vault',
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    id: 'learning',
    type: 'module' as const,
    title: 'Learning',
    description: 'Training and educational content',
    url: '/learning',
    roles: ['all']
  },
  {
    id: 'payroll',
    type: 'module' as const,
    title: 'Payroll',
    description: 'Payroll processing and management',
    url: '/admin/payroll',
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'cms',
    type: 'module' as const,
    title: 'Case Management',
    description: 'HR case tracking and management',
    url: '/cms',
    roles: ['super_admin', 'company_admin', 'client_admin']
  }
];

export const useIQSearch = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { userRole } = useAuth();

  const hasRoleAccess = (requiredRoles: string[]) => {
    return requiredRoles.includes('all') || (userRole && requiredRoles.includes(userRole));
  };

  const searchModules = (query: string): SearchResult[] => {
    const lowerQuery = query.toLowerCase();
    return navigationModules
      .filter(module => hasRoleAccess(module.roles))
      .filter(module => 
        module.title.toLowerCase().includes(lowerQuery) ||
        module.description.toLowerCase().includes(lowerQuery)
      )
      .map(module => ({
        id: module.id,
        type: module.type,
        title: module.title,
        description: module.description,
        url: module.url
      }));
  };

  const searchDatabase = async (query: string): Promise<SearchResult[]> => {
    const results: SearchResult[] = [];
    
    try {
      // Search company_settings table (more likely to exist)
      const { data: companies } = await supabase
        .from('company_settings')
        .select('id, company_name')
        .ilike('company_name', `%${query}%`)
        .limit(5);

      if (companies) {
        results.push(...companies.map((company: any) => ({
          id: company.id,
          type: 'company' as const,
          title: company.company_name,
          description: 'Company',
          url: `/admin/companies/${company.id}`
        })));
      }

      // Search employees
      const { data: employees } = await supabase
        .from('employees')
        .select('id, first_name, last_name, position')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .limit(5);

      if (employees) {
        results.push(...employees.map((employee: any) => ({
          id: employee.id,
          type: 'employee' as const,
          title: `${employee.first_name} ${employee.last_name}`,
          description: employee.position || 'Employee',
          url: `/admin/employees/${employee.id}`
        })));
      }

    } catch (error) {
      console.error('Search error:', error);
    }

    return results;
  };

  const executeSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Search modules first (local, fast)
      const moduleResults = searchModules(query);
      
      // Search database (async)
      const dbResults = await searchDatabase(query);
      
      // Combine and sort results
      const allResults = [...moduleResults, ...dbResults];
      
      // Sort by relevance (exact matches first, then partial matches)
      const sortedResults = allResults.sort((a, b) => {
        const aExact = a.title.toLowerCase() === query.toLowerCase() ? 1 : 0;
        const bExact = b.title.toLowerCase() === query.toLowerCase() ? 1 : 0;
        return bExact - aExact;
      });

      setSearchResults(sortedResults);
    } catch (error) {
      console.error('Execute search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [userRole]);

  return {
    searchResults,
    isLoading,
    executeSearch
  };
};