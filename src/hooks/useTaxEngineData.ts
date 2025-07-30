import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

interface TaxEngineStats {
  totalJurisdictions: number;
  employeesWithMultiState: number;
  activeNexusStates: number;
  totalTaxWithheld: number;
}

/**
 * Hook to fetch tax engine overview data for a specific client
 */
export function useTaxEngineData(clientId?: string) {
  // Fetch total jurisdictions (unique states from company locations and employee tax profiles)
  const jurisdictionsQuery = useSupabaseQuery(
    ['tax-jurisdictions', clientId],
    async () => {
      if (!clientId) return { data: { count: 0 }, error: null };

      // Get unique states from company locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('company_locations')
        .select('state')
        .eq('company_id', clientId);

      if (locationsError) return { data: null, error: locationsError };

      // Get unique states from employee tax profiles via employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id')
        .eq('company_id', clientId);

      if (employeesError) return { data: null, error: employeesError };

      const employeeIds = employeesData?.map(e => e.id) || [];
      
      const { data: taxProfilesData, error: taxProfilesError } = await supabase
        .from('employee_tax_profiles')
        .select('state_code')
        .in('employee_id', employeeIds);

      if (taxProfilesError) return { data: null, error: taxProfilesError };

      // Combine and count unique jurisdictions
      const statesFromLocations = locationsData?.map(l => l.state).filter(Boolean) || [];
      const statesFromTaxProfiles = taxProfilesData?.map(t => t.state_code).filter(Boolean) || [];
      
      const uniqueStates = new Set([...statesFromLocations, ...statesFromTaxProfiles]);
      
      return { data: { count: uniqueStates.size }, error: null };
    },
    { enabled: !!clientId }
  );

  // Fetch multi-state employees (employees with tax profiles in different states)
  const multiStateEmployeesQuery = useSupabaseQuery(
    ['multi-state-employees', clientId],
    async () => {
      if (!clientId) return { data: { count: 0 }, error: null };

      // Get employees for this company
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id')
        .eq('company_id', clientId);

      if (employeesError) return { data: null, error: employeesError };

      const employeeIds = employeesData?.map(e => e.id) || [];
      
      const { data, error } = await supabase
        .from('employee_tax_profiles')
        .select('employee_id, state_code')
        .in('employee_id', employeeIds);

      if (error) return { data: null, error };

      // Group by employee_id and count employees with multiple states
      const employeeStates = new Map<string, Set<string>>();
      
      data?.forEach(profile => {
        if (!employeeStates.has(profile.employee_id)) {
          employeeStates.set(profile.employee_id, new Set());
        }
        if (profile.state_code) {
          employeeStates.get(profile.employee_id)!.add(profile.state_code);
        }
      });

      const multiStateCount = Array.from(employeeStates.values())
        .filter(states => states.size > 1).length;

      return { data: { count: multiStateCount }, error: null };
    },
    { enabled: !!clientId }
  );

  // Fetch active nexus states (states where company has tax registrations)
  const activeNexusQuery = useSupabaseQuery(
    ['active-nexus-states', clientId],
    async () => {
      if (!clientId) return { data: { count: 0 }, error: null };

      const { data, error } = await supabase
        .from('tax_profiles')
        .select('state_tax_ids')
        .eq('company_id', clientId)
        .not('state_tax_ids', 'is', null);

      if (error) return { data: null, error };

      // Count unique states with tax IDs
      const uniqueStates = new Set<string>();
      data?.forEach(profile => {
        if (profile.state_tax_ids && typeof profile.state_tax_ids === 'object') {
          Object.keys(profile.state_tax_ids).forEach(state => uniqueStates.add(state));
        }
      });

      return { data: { count: uniqueStates.size }, error: null };
    },
    { enabled: !!clientId }
  );

  // Fetch YTD tax withheld (from payroll tax withholdings)
  const ytdTaxWithheldQuery = useSupabaseQuery(
    ['ytd-tax-withheld', clientId],
    async () => {
      if (!clientId) return { data: { total: 0 }, error: null };

      const currentYear = new Date().getFullYear();
      const yearStart = `${currentYear}-01-01`;

      // For now, return 0 until we establish proper relationships
      // This will be updated once we have the correct foreign key setup
      const { data, error } = await supabase
        .from('payroll_tax_withholdings')
        .select('total_withholdings')
        .limit(0); // Return empty for now

      if (error) return { data: null, error };

      const total = data?.reduce((sum, record) => sum + (record.total_withholdings || 0), 0) || 0;

      return { data: { total }, error: null };
    },
    { enabled: !!clientId }
  );

  const isLoading = jurisdictionsQuery.isLoading || 
                   multiStateEmployeesQuery.isLoading || 
                   activeNexusQuery.isLoading || 
                   ytdTaxWithheldQuery.isLoading;

  const error = jurisdictionsQuery.error || 
                multiStateEmployeesQuery.error || 
                activeNexusQuery.error || 
                ytdTaxWithheldQuery.error;

  const stats: TaxEngineStats = {
    totalJurisdictions: jurisdictionsQuery.data?.count || 0,
    employeesWithMultiState: multiStateEmployeesQuery.data?.count || 0,
    activeNexusStates: activeNexusQuery.data?.count || 0,
    totalTaxWithheld: ytdTaxWithheldQuery.data?.total || 0,
  };

  return {
    stats,
    isLoading,
    error,
    refetch: () => {
      jurisdictionsQuery.refetch();
      multiStateEmployeesQuery.refetch();
      activeNexusQuery.refetch();
      ytdTaxWithheldQuery.refetch();
    }
  };
}