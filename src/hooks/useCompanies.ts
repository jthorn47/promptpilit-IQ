import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SalesLifecycleStage, SalesFunnelMetrics } from "@/components/SalesFunnelTiles";

export interface Company {
  id: string;
  company_name: string;
  max_employees: number;
  subscription_status: string;
  primary_color: string;
  created_at: string;
  updated_at: string;
  sales_lifecycle_stage: SalesLifecycleStage;
  last_contact_date?: string;
  proposal_sent_date?: string;
  onboarding_start_date?: string;
  payment_start_date?: string;
  sales_rep_assigned?: string;
  lead_source?: string;
  lost_reason?: string;
  stage_transition_history?: any; // Keep as any for JSON compatibility
  last_activity_date?: string;
  has_paying_clients?: boolean;
  paying_clients_count?: number;
  client_type?: string;
  // Additional fields for the configuration panel
  ein?: string;
  address?: string;
  website?: string;
  timezone?: string;
  company_owner?: string;
  bdm?: string;
  recruiter?: string;
  business_description?: string;
  internal_notes?: string;
}

export interface CreateCompanyData {
  company_name: string;
  max_employees: number;
  sales_lifecycle_stage?: SalesLifecycleStage;
  sales_rep_assigned?: string;
  lead_source?: string;
}

export interface UpdateLifecycleStageData {
  companyId: string;
  newStage: SalesLifecycleStage;
  notes?: string;
}

export type SortOption = 
  | 'name_asc' 
  | 'name_desc' 
  | 'created_newest' 
  | 'created_oldest' 
  | 'lifecycle_stage';

export interface CompanyFilters {
  lifecycleStages?: SalesLifecycleStage[];
  salesRep?: string;
  leadSource?: string;
  searchTerm?: string;
  sortBy?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
}

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [totalCompaniesCount, setTotalCompaniesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    pageSize: 25,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    startIndex: 0,
    endIndex: 0
  });
  const [filters, setFilters] = useState<CompanyFilters>(() => {
    // Load sort and pagination preferences from localStorage
    const savedSort = localStorage.getItem('companies-sort-preference');
    const savedPageSize = localStorage.getItem('companies-page-size');
    const savedPage = localStorage.getItem('companies-current-page');
    return {
      sortBy: (savedSort as SortOption) || 'created_newest',
      page: parseInt(savedPage || '1'),
      pageSize: parseInt(savedPageSize || '25')
    };
  });
  const { toast } = useToast();

  const fetchTotalCount = async () => {
    // Just get the total count efficiently
    const { count, error } = await supabase
      .from('company_settings')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    setTotalCompaniesCount(count || 0);
  };

  const fetchCompanies = async (useServerPagination = true) => {
    try {
      setLoading(true);
      
      // Fetch total count efficiently
      await fetchTotalCount();
      
      // Fetch limited companies for calculations (first 1000 for backward compatibility)
      await fetchAllCompanies();
      
      if (useServerPagination) {
        await fetchPaginatedCompanies();
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      
      // Log the specific error details for debugging
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // More specific error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Failed to fetch companies",
        description: `Error: ${errorMessage}. Please try refreshing the page.`,
        variant: "destructive",
      });
      
      // Set some basic state even on error
      setCompanies([]);
      setAllCompanies([]);
      setTotalCompaniesCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaginatedCompanies = async () => {
    const currentPage = filters.page || 1;
    const pageSize = filters.pageSize || 25;
    const offset = (currentPage - 1) * pageSize;

    // Build the query with filters
    let query = supabase
      .from('company_settings')
      .select(`
        *,
        clients!company_settings_id (
          id,
          payment_status,
          subscription_status,
          stripe_subscription_id,
          status
        )
      `, { count: 'exact' });

    // Apply filters
    if (filters.lifecycleStages && filters.lifecycleStages.length > 0) {
      query = query.in('sales_lifecycle_stage', filters.lifecycleStages);
    }

    if (filters.salesRep) {
      query = query.eq('sales_rep_assigned', filters.salesRep);
    }

    if (filters.leadSource) {
      query = query.eq('lead_source', filters.leadSource);
    }

    if (filters.searchTerm) {
      query = query.or(`company_name.ilike.%${filters.searchTerm}%,sales_rep_assigned.ilike.%${filters.searchTerm}%,lead_source.ilike.%${filters.searchTerm}%`);
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'created_newest';
    switch (sortBy) {
      case 'name_asc':
        query = query.order('company_name', { ascending: true });
        break;
      case 'name_desc':
        query = query.order('company_name', { ascending: false });
        break;
      case 'created_newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'created_oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'lifecycle_stage':
        query = query.order('sales_lifecycle_stage', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Transform the data
    const transformedData: Company[] = (data || []).map((item) => {
        // Calculate paying clients locally (more reliable than RPC)
        const clients = item.clients || [];
        const payingClients = clients.filter((client: any) => {
          return (
            client.status === 'active' &&
            (
              (client.payment_status === 'paid' || client.payment_status === 'active') ||
              (client.subscription_status === 'active') ||
              client.stripe_subscription_id
            )
          );
        });

        const hasPayingClients = payingClients.length > 0;

        return {
          id: item.id,
          company_name: item.company_name,
          max_employees: item.max_employees || 0,
          subscription_status: item.subscription_status || 'trial',
          primary_color: item.primary_color || '#655DC6',
          created_at: item.created_at,
          updated_at: item.updated_at,
          sales_lifecycle_stage: item.sales_lifecycle_stage || 'prospect',
          last_contact_date: item.last_contact_date,
          proposal_sent_date: item.proposal_sent_date,
          onboarding_start_date: item.onboarding_start_date,
          payment_start_date: item.payment_start_date,
          sales_rep_assigned: item.sales_rep_assigned,
          lead_source: item.lead_source,
          lost_reason: item.lost_reason,
          stage_transition_history: item.stage_transition_history,
          last_activity_date: item.last_activity_date,
          has_paying_clients: hasPayingClients,
          paying_clients_count: payingClients.length,
          client_type: item.client_type
        };
      });

    setCompanies(transformedData);
    
    // Update pagination info
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    setPagination({
      currentPage,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      startIndex: offset + 1,
      endIndex: Math.min(offset + pageSize, totalCount)
    });
  };

  const fetchAllCompanies = async () => {
    // Fetch all companies for stats calculations (without pagination)
    // Use limit(null) to ensure we get all records
    const { data, error } = await supabase
      .from('company_settings')
      .select(`
        *,
        clients!company_settings_id (
          id,
          payment_status,
          subscription_status,
          stripe_subscription_id,
          status
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform the data
    const transformedData: Company[] = (data || []).map((item) => {
        // Calculate paying clients locally (more reliable than RPC)
        const clients = item.clients || [];
        const payingClients = clients.filter((client: any) => {
          return (
            client.status === 'active' &&
            (
              (client.payment_status === 'paid' || client.payment_status === 'active') ||
              (client.subscription_status === 'active') ||
              client.stripe_subscription_id
            )
          );
        });

        const hasPayingClients = payingClients.length > 0;

        return {
          id: item.id,
          company_name: item.company_name,
          max_employees: item.max_employees || 0,
          subscription_status: item.subscription_status || 'trial',
          primary_color: item.primary_color || '#655DC6',
          created_at: item.created_at,
          updated_at: item.updated_at,
          sales_lifecycle_stage: item.sales_lifecycle_stage || 'prospect',
          last_contact_date: item.last_contact_date,
          proposal_sent_date: item.proposal_sent_date,
          onboarding_start_date: item.onboarding_start_date,
          payment_start_date: item.payment_start_date,
          sales_rep_assigned: item.sales_rep_assigned,
          lead_source: item.lead_source,
          lost_reason: item.lost_reason,
          stage_transition_history: item.stage_transition_history,
          last_activity_date: item.last_activity_date,
          has_paying_clients: hasPayingClients,
          paying_clients_count: payingClients.length,
          client_type: item.client_type
        };
      });

    setAllCompanies(transformedData);
  };

  const createCompany = async (companyData: CreateCompanyData) => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .insert([{
          company_name: companyData.company_name,
          max_employees: companyData.max_employees,
          subscription_status: 'trial',
          primary_color: '#655DC6',
          sales_lifecycle_stage: companyData.sales_lifecycle_stage || 'prospect',
          sales_rep_assigned: companyData.sales_rep_assigned,
          lead_source: companyData.lead_source,
        }])
        .select()
        .single();

      if (error) throw error;

      // Transform the created data
      const newCompany: Company = {
        id: data.id,
        company_name: data.company_name,
        max_employees: data.max_employees || 0,
        subscription_status: data.subscription_status || 'trial',
        primary_color: data.primary_color || '#655DC6',
        created_at: data.created_at,
        updated_at: data.updated_at,
        sales_lifecycle_stage: data.sales_lifecycle_stage || 'prospect',
        last_contact_date: data.last_contact_date,
        proposal_sent_date: data.proposal_sent_date,
        onboarding_start_date: data.onboarding_start_date,
        payment_start_date: data.payment_start_date,
        sales_rep_assigned: data.sales_rep_assigned,
        lead_source: data.lead_source,
        lost_reason: data.lost_reason,
        stage_transition_history: data.stage_transition_history,
        last_activity_date: data.last_activity_date,
        has_paying_clients: false,
        paying_clients_count: 0,
        client_type: data.client_type
      };

      setCompanies(prev => [newCompany, ...prev]);
      toast({
        title: "Success",
        description: `Company "${companyData.company_name}" created successfully`,
      });

      return true;
    } catch (error) {
      console.error('Error creating company:', error);
      toast({
        title: "Error",
        description: "Failed to create company",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateLifecycleStage = async ({ companyId, newStage, notes }: UpdateLifecycleStageData) => {
    try {
      // Check if user is trying to downgrade from active_paying_client
      const company = companies.find(c => c.id === companyId);
      if (company?.sales_lifecycle_stage === 'active_paying_client' && 
          newStage !== 'active_paying_client' && 
          company.has_paying_clients) {
        
        const confirmed = window.confirm(
          `This company has active paying clients. Are you sure you want to downgrade the lifecycle stage from "Active Paying Client" to "${newStage.replace('_', ' ')}"?`
        );
        
        if (!confirmed) {
          return false;
        }
      }

      const updateData: any = {
        sales_lifecycle_stage: newStage,
        last_activity_date: new Date().toISOString(),
      };

      // Set stage-specific date fields
      switch (newStage) {
        case 'contacted':
          updateData.last_contact_date = new Date().toISOString();
          break;
        case 'proposal_sent':
          updateData.proposal_sent_date = new Date().toISOString();
          break;
        case 'in_onboarding':
          updateData.onboarding_start_date = new Date().toISOString();
          break;
        case 'active_paying_client':
          updateData.payment_start_date = new Date().toISOString();
          break;
      }

      const { data, error } = await supabase
        .from('company_settings')
        .update(updateData)
        .eq('id', companyId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { 
              ...company, 
              sales_lifecycle_stage: newStage,
              last_contact_date: updateData.last_contact_date || company.last_contact_date,
              proposal_sent_date: updateData.proposal_sent_date || company.proposal_sent_date,
              onboarding_start_date: updateData.onboarding_start_date || company.onboarding_start_date,
              payment_start_date: updateData.payment_start_date || company.payment_start_date,
              last_activity_date: updateData.last_activity_date,
              updated_at: data.updated_at
            }
          : company
      ));

      toast({
        title: "Success",
        description: `Company moved to ${newStage.replace('_', ' ')} stage`,
      });

      return true;
    } catch (error) {
      console.error('Error updating lifecycle stage:', error);
      toast({
        title: "Error",
        description: "Failed to update lifecycle stage",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCompany = async (companyId: string, onSuccess?: () => void) => {
    try {
      const { error } = await supabase
        .from('company_settings')
        .delete()
        .eq('id', companyId);

      if (error) throw error;

      setCompanies(prev => prev.filter(company => company.id !== companyId));
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });

      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: "Error",
        description: "Failed to delete company",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateCompany = async (companyId: string, updateData: Partial<Company>) => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .update(updateData)
        .eq('id', companyId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { ...company, ...updateData, updated_at: data.updated_at }
          : company
      ));

      setAllCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { ...company, ...updateData, updated_at: data.updated_at }
          : company
      ));

      return true;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  };

  // Calculate funnel metrics from all companies
  const getFunnelMetrics = (): SalesFunnelMetrics => {
    return {
      // New lifecycle stage metrics
      leadsNew: allCompanies.filter(c => 
        c.sales_lifecycle_stage === 'lead_new'
      ).length,
      prospectsQualified: allCompanies.filter(c => 
        c.sales_lifecycle_stage === 'prospect_qualified'
      ).length,
      proposalsSent: allCompanies.filter(c => 
        c.sales_lifecycle_stage === 'proposal_sent'
      ).length,
      clientsActive: allCompanies.filter(c => 
        c.sales_lifecycle_stage === 'client_active'
      ).length,
      clientsInactive: allCompanies.filter(c => 
        c.sales_lifecycle_stage === 'client_inactive'
      ).length,
      disqualified: allCompanies.filter(c => 
        c.sales_lifecycle_stage === 'disqualified_no_fit'
      ).length,
      // Legacy metrics for backwards compatibility
      prospectsInPipeline: allCompanies.filter(c => 
        ['prospect', 'contacted'].includes(c.sales_lifecycle_stage)
      ).length,
      engagedLeads: allCompanies.filter(c => 
        c.sales_lifecycle_stage === 'engaged'
      ).length,
      clientsOnboarding: allCompanies.filter(c => 
        c.sales_lifecycle_stage === 'in_onboarding'
      ).length,
      activePayingClients: allCompanies.filter(c => 
        c.sales_lifecycle_stage === 'active_paying_client' && c.has_paying_clients
      ).length,
      dormantAccounts: allCompanies.filter(c => 
        c.sales_lifecycle_stage === 'dormant_churned'
      ).length,
    };
  };

  // Define lifecycle stage order for sorting
  const getLifecycleStageOrder = (stage: SalesLifecycleStage): number => {
    const order: Record<SalesLifecycleStage, number> = {
      // New lifecycle stages
      lead_new: 1,
      prospect_qualified: 2,
      proposal_sent: 3,
      client_active: 4,
      client_inactive: 5,
      disqualified_no_fit: 6,
      // Legacy stages for backwards compatibility
      prospect: 1,
      contacted: 2,
      engaged: 3,
      in_onboarding: 5,
      active_paying_client: 6,
      dormant_churned: 7
    };
    return order[stage] || 0;
  };

  // Sort companies based on current sort option
  const getSortedCompanies = (companiesToSort: Company[]): Company[] => {
    const sortBy = filters.sortBy || 'created_newest';
    
    return [...companiesToSort].sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.company_name.localeCompare(b.company_name);
        case 'name_desc':
          return b.company_name.localeCompare(a.company_name);
        case 'created_newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'created_oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'lifecycle_stage':
          return getLifecycleStageOrder(a.sales_lifecycle_stage) - getLifecycleStageOrder(b.sales_lifecycle_stage);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  };

  // Apply filters and sorting to companies
  const getFilteredAndSortedCompanies = (): Company[] => {
    const filtered = companies.filter(company => {
      // Lifecycle stage filter
      if (filters.lifecycleStages && filters.lifecycleStages.length > 0) {
        if (!filters.lifecycleStages.includes(company.sales_lifecycle_stage)) {
          return false;
        }
      }

      // Sales rep filter
      if (filters.salesRep && company.sales_rep_assigned !== filters.salesRep) {
        return false;
      }

      // Lead source filter
      if (filters.leadSource && company.lead_source !== filters.leadSource) {
        return false;
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const nameMatch = company.company_name.toLowerCase().includes(searchLower);
        const repMatch = company.sales_rep_assigned?.toLowerCase().includes(searchLower);
        const sourceMatch = company.lead_source?.toLowerCase().includes(searchLower);
        
        if (!nameMatch && !repMatch && !sourceMatch) {
          return false;
        }
      }

      return true;
    });

    return getSortedCompanies(filtered);
  };

  // Filter by lifecycle stages
  const filterByLifecycleStages = (stages: SalesLifecycleStage[]) => {
    setFilters(prev => ({ ...prev, lifecycleStages: stages, page: 1 }));
    localStorage.setItem('companies-current-page', '1');
  };

  // Set sort option and persist to localStorage
  const setSortBy = (sortOption: SortOption) => {
    setFilters(prev => ({ ...prev, sortBy: sortOption, page: 1 }));
    localStorage.setItem('companies-sort-preference', sortOption);
    localStorage.setItem('companies-current-page', '1');
  };

  // Set page
  const setPage = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    localStorage.setItem('companies-current-page', page.toString());
  };

  // Set page size
  const setPageSize = (pageSize: number) => {
    setFilters(prev => ({ ...prev, pageSize, page: 1 }));
    localStorage.setItem('companies-page-size', pageSize.toString());
    localStorage.setItem('companies-current-page', '1');
  };

  // Clear all filters but keep sort and pagination preferences
  const clearFilters = () => {
    const currentSort = filters.sortBy || 'created_newest';
    const currentPageSize = filters.pageSize || 25;
    setFilters({ sortBy: currentSort, pageSize: currentPageSize, page: 1 });
    localStorage.setItem('companies-current-page', '1');
  };

  // Get unique sales reps
  const getSalesReps = (): string[] => {
    const reps = companies
      .map(c => c.sales_rep_assigned)
      .filter((rep): rep is string => !!rep);
    return [...new Set(reps)].sort();
  };

  // Get unique lead sources
  const getLeadSources = (): string[] => {
    const sources = companies
      .map(c => c.lead_source)
      .filter((source): source is string => !!source);
    return [...new Set(sources)].sort();
  };

  useEffect(() => {
    fetchCompanies(true); // Use server-side pagination
    fetchAllCompanies(); // Fetch all for stats
  }, []);

  useEffect(() => {
    fetchCompanies(true); // Refetch when filters change
  }, [filters.page, filters.pageSize, filters.lifecycleStages, filters.salesRep, filters.leadSource, filters.searchTerm, filters.sortBy]);

  return {
    companies,
    allCompanies,
    totalCompaniesCount,
    loading,
    filters,
    pagination,
    funnelMetrics: getFunnelMetrics(),
    createCompany,
    updateCompany,
    updateLifecycleStage,
    deleteCompany,
    filterByLifecycleStages,
    clearFilters,
    setFilters,
    setSortBy,
    setPage,
    setPageSize,
    getSalesReps,
    getLeadSources,
    refetch: () => fetchCompanies(true)
  };
};