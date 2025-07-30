import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Building2, Trash2, Users, Calendar, Search, Filter, X, ClipboardCheck, ShieldCheck, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCompanies } from "@/hooks/useCompanies";
import { useSuperAdminMetrics } from "@/hooks/useSuperAdminMetrics";
import { CompanyWizardDialog } from "@/components/companies/CompanyWizardDialog";
import { SalesFunnelTiles, SalesLifecycleStage } from "@/components/SalesFunnelTiles";
import { CompanyLifecycleFilter } from "@/components/companies/CompanyLifecycleFilter";
import { SortControl } from "@/components/companies/SortControl";
import { PaginationControls } from "@/components/pagination/PaginationControls";
import { SimplePagination } from "@/components/pagination/SimplePagination";
import { ClientTypeFilter, ClientType } from "@/components/companies/ClientTypeFilter";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CompanyConfigurationPanel } from "@/components/companies/CompanyConfigurationPanel";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ActivityFeedTile } from "@/components/shared/ActivityFeedTile";

// Remove ITEMS_PER_PAGE since we're using server-side pagination

export default function CompaniesPage() {
  console.log('🏢 CompaniesPage: Component initializing');
  
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id: companyId } = useParams();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { 
    companies, 
    allCompanies,
    totalCompaniesCount,
    loading, 
    funnelMetrics, 
    filters,
    pagination,
    createCompany, 
    updateCompany,
    deleteCompany, 
    filterByLifecycleStages,
    clearFilters,
    setFilters,
    setSortBy,
    setPage,
    setPageSize
  } = useCompanies();
  const { metrics: superAdminMetrics, loading: metricsLoading } = useSuperAdminMetrics();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientTypeFilter, setClientTypeFilter] = useState<ClientType>("all");
  const [clientPage, setClientPage] = useState(1);
  const [selectedCompanyForConfig, setSelectedCompanyForConfig] = useState(null);
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  
  // Use the hook's search term filter for consistency
  const searchTerm = filters.searchTerm || "";

  const handleCreateCompany = async (formData: any) => {
    try {
      const success = await createCompany({
        company_name: formData.company_name,
        max_employees: formData.employee_count || 25
      });

      if (success) {
        toast({
          title: "Success",
          description: "Company created successfully",
        });
        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create company",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    await deleteCompany(companyId);
  };

  const handleManageCompany = (e: React.MouseEvent, company: any) => {
    e.stopPropagation();
    setSelectedCompanyForConfig(company);
    setIsConfigPanelOpen(true);
  };

  const handleTileClick = (stages: SalesLifecycleStage[]) => {
    filterByLifecycleStages(stages);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isNewCompany = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24;
  };

  const getLifecycleStageBadge = (stage: SalesLifecycleStage) => {
    const stageConfig = {
      prospect: { label: 'Prospect', variant: 'secondary' as const, color: 'bg-gradient-to-r from-blue-500/10 to-blue-600/20 text-blue-700 border-blue-300 shadow-sm' },
      contacted: { label: 'Contacted', variant: 'secondary' as const, color: 'bg-gradient-to-r from-indigo-500/10 to-indigo-600/20 text-indigo-700 border-indigo-300 shadow-sm' },
      engaged: { label: 'Engaged', variant: 'default' as const, color: 'bg-gradient-to-r from-green-500/10 to-green-600/20 text-green-700 border-green-300 shadow-sm' },
      proposal_sent: { label: 'Proposal Sent', variant: 'outline' as const, color: 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/20 text-yellow-700 border-yellow-300 shadow-sm' },
      in_onboarding: { label: 'Onboarding', variant: 'outline' as const, color: 'bg-gradient-to-r from-orange-500/10 to-orange-600/20 text-orange-700 border-orange-300 shadow-sm' },
      active_paying_client: { label: 'Active Client', variant: 'default' as const, color: 'bg-gradient-to-r from-purple-500/10 to-purple-600/20 text-purple-700 border-purple-300 shadow-sm' },
      dormant_churned: { label: 'Dormant', variant: 'destructive' as const, color: 'bg-gradient-to-r from-red-500/10 to-red-600/20 text-red-700 border-red-300 shadow-sm' }
    };
    
    return stageConfig[stage] || stageConfig.prospect;
  };

  const getEmployeeCountTotal = () => {
    return allCompanies.reduce((sum, company) => sum + (company.max_employees || 0), 0);
  };

  const getActiveCompaniesCount = () => {
    return allCompanies.filter(company => 
      company.subscription_status === 'active' || company.subscription_status === 'premium'
    ).length;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      case 'premium': return 'outline';
      default: return 'destructive';
    }
  };

  // Apply status and client type filters to the companies (already paginated by server)
  const statusFilteredCompanies = statusFilter === "all" 
    ? companies 
    : companies.filter(company => company.subscription_status === statusFilter);
  
  const clientTypeFilteredCompanies = clientTypeFilter === "all"
    ? statusFilteredCompanies
    : statusFilteredCompanies.filter(company => 
        company.client_type === clientTypeFilter || 
        (clientTypeFilter === "both" && company.client_type === "both")
      );

  // For client-side status/client type filter, we need to apply pagination manually
  const shouldUseClientPagination = statusFilter !== "all" || clientTypeFilter !== "all";
  
  // Client-side pagination for status/client type filtering
  const clientItemsPerPage = 25;
  const clientTotalPages = Math.ceil(clientTypeFilteredCompanies.length / clientItemsPerPage);
  const clientStartIndex = (clientPage - 1) * clientItemsPerPage;
  const clientPaginatedCompanies = clientTypeFilteredCompanies.slice(clientStartIndex, clientStartIndex + clientItemsPerPage);
  
  const displayedCompanies = shouldUseClientPagination ? clientPaginatedCompanies : companies;

  // Show pagination notice if client-side filtering is active
  const showClientFilterNotice = shouldUseClientPagination && clientTypeFilteredCompanies.length < companies.length;

  // Reset client page when status or client type filter changes
  useEffect(() => {
    setClientPage(1);
  }, [statusFilter, clientTypeFilter]);

  // Handle URL-based company management (edit/manage routes AND direct company ID routes)
  useEffect(() => {
    const isManageRoute = location.pathname.includes('/edit/') || location.pathname.includes('/manage/');
    const isDirectCompanyRoute = companyId && location.pathname === `/admin/companies/${companyId}`;
    
    if ((isManageRoute || isDirectCompanyRoute) && companyId && !loading && companies.length > 0) {
      const targetCompany = companies.find(company => company.id === companyId);
      
      if (targetCompany) {
        setSelectedCompanyForConfig(targetCompany);
        setIsConfigPanelOpen(true);
      } else {
        // Company not found in current page, search all companies
        const allCompany = allCompanies.find(company => company.id === companyId);
        if (allCompany) {
          setSelectedCompanyForConfig(allCompany);
          setIsConfigPanelOpen(true);
        } else {
          toast({
            title: "Company Not Found",
            description: "The requested company could not be found.",
            variant: "destructive",
          });
          navigate('/admin/companies');
        }
      }
    }
  }, [companyId, location.pathname, companies, allCompanies, loading, navigate, toast]);

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Only super administrators can access company management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Companies</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-sm text-muted-foreground">
            Manage your sales pipeline and client relationships
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {filters.lifecycleStages && filters.lifecycleStages.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-3 w-3" />
              Clear Filters
            </Button>
          )}
          <Button 
            className="flex items-center gap-2"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Add Company</span>
          </Button>
        </div>
      </div>

      {/* Company Lifecycle Filter Tiles */}
      <CompanyLifecycleFilter
        metrics={funnelMetrics}
        selectedStages={filters.lifecycleStages || []}
        onFilterClick={handleTileClick}
        onClearFilters={clearFilters}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Companies</p>
                <p className="text-2xl font-bold text-primary">{totalCompaniesCount}</p>
                {companies.length !== totalCompaniesCount && (
                  <p className="text-xs text-muted-foreground">
                    Showing {companies.length} filtered
                  </p>
                )}
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Companies</p>
                <p className="text-2xl font-bold text-green-600">
                  {getActiveCompaniesCount()}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Premium Companies</p>
                <p className="text-2xl font-bold text-orange-600">
                  {allCompanies.filter(c => c.subscription_status === 'premium').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href = '/admin/assessments?filter=completed'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">HR Risk Assessments</p>
                <p className="text-2xl font-bold text-blue-600">{metricsLoading ? '...' : superAdminMetrics.hrAssessmentsCompleted}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <ClipboardCheck className="w-3 h-3 mr-1" />
                  Completed
                </p>
              </div>
              <ClipboardCheck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href = '/admin/wpv-plans?filter=completed'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">WPV Wizards</p>
                <p className="text-2xl font-bold text-green-600">{metricsLoading ? '...' : superAdminMetrics.wpvWizardsCompleted}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Completed
                </p>
              </div>
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Wizard Dialog */}
      <CompanyWizardDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleCreateCompany}
      />

      {/* Filters and Sort */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value, page: 1 }))}
            className="pl-10"
          />
        </div>

        {/* Client Type and Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <ClientTypeFilter
            selectedType={clientTypeFilter}
            onFilterChange={setClientTypeFilter}
          />
          
          <div className="sm:ml-auto">
            <SortControl 
              value={filters.sortBy || 'created_newest'}
              onChange={setSortBy}
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            size="sm"
            className="flex-shrink-0"
          >
            All
          </Button>
          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            onClick={() => setStatusFilter("active")}
            size="sm"
            className="flex-shrink-0"
          >
            Active
          </Button>
          <Button
            variant={statusFilter === "premium" ? "default" : "outline"}
            onClick={() => setStatusFilter("premium")}
            size="sm"
            className="flex-shrink-0"
          >
            Premium
          </Button>
          <Button
            variant={statusFilter === "trial" ? "default" : "outline"}
            onClick={() => setStatusFilter("trial")}
            size="sm"
            className="flex-shrink-0"
          >
            Trial
          </Button>
        </div>
      </div>

      {/* Companies Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading companies...</p>
            </div>
          ) : displayedCompanies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No companies found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchTerm || statusFilter !== "all" 
                  ? "No companies match your current search criteria."
                  : "Get started by adding your first company to the system."
                }
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {displayedCompanies.map((company) => {
                const badgeConfig = getLifecycleStageBadge(company.sales_lifecycle_stage);
                
                return (
                  <Card 
                    key={company.id} 
                    className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-primary/30 hover:border-l-primary"
                    onClick={() => navigate(`/admin/companies/${company.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative flex-shrink-0">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/20 flex items-center justify-center shadow-sm">
                              <Building2 className="h-7 w-7 text-primary" />
                            </div>
                            {isNewCompany(company.created_at) && (
                              <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full animate-pulse border-2 border-background" />
                            )}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors truncate">
                                {company.company_name}
                              </h3>
                              <Badge className={badgeConfig.color}>
                                {badgeConfig.label}
                              </Badge>
                              <Badge variant={getStatusBadgeVariant(company.subscription_status)} className="capitalize">
                                {company.subscription_status}
                              </Badge>
                              {isNewCompany(company.created_at) && (
                                <Badge variant="secondary" className="bg-gradient-to-r from-orange-500/10 to-orange-600/20 text-orange-700 border-orange-300 shadow-sm">
                                  ✨ New
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{company.max_employees || 0} employees</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Created {formatDate(company.created_at)}</span>
                              </div>
                              {company.client_type && (
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  <span className="capitalize">{company.client_type.replace('_', ' ')} client</span>
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                ID: #{company.id.slice(0, 8)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div onClick={(e) => e.stopPropagation()}>
                            <ActivityFeedTile 
                              entityType="company"
                              entityId={company.id}
                              entityName={company.company_name}
                              className="min-w-[120px]"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleManageCompany(e, company)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Settings className="h-4 w-4" />
                            <span className="sr-only">Manage {company.company_name}</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client filter notice */}
      {showClientFilterNotice && (
        <div className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-950 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
          <span className="font-medium">Note:</span> Status filtering is applied client-side. 
          Showing {statusFilteredCompanies.length} of {companies.length} companies from current page.
        </div>
      )}

      {/* Server-side Pagination Controls */}
      {!shouldUseClientPagination && (
        <PaginationControls
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Client-side Pagination Controls for Status Filtering */}
      {shouldUseClientPagination && clientTotalPages > 1 && (
        <SimplePagination
          currentPage={clientPage}
          totalPages={clientTotalPages}
          itemsPerPage={clientItemsPerPage}
          totalItems={statusFilteredCompanies.length}
          onPageChange={setClientPage}
         />
       )}

       {/* Company Configuration Panel */}
       {selectedCompanyForConfig && (
         <CompanyConfigurationPanel
           isOpen={isConfigPanelOpen}
            onClose={() => {
              setIsConfigPanelOpen(false);
              setSelectedCompanyForConfig(null);
              // If we came from a URL route, navigate back to companies list
              const isManageRoute = location.pathname.includes('/edit/') || location.pathname.includes('/manage/');
              if (isManageRoute) {
                navigate('/admin/companies');
              }
            }}
           company={selectedCompanyForConfig}
           onSave={async (updatedCompany) => {
             try {
             await updateCompany(updatedCompany.id, updatedCompany);
             // Refresh the companies list to reflect changes
             setSelectedCompanyForConfig(null);
             setIsConfigPanelOpen(false);
             toast({
               title: "Company Updated",
               description: `${updatedCompany.company_name} has been updated successfully.`,
             });
             } catch (error) {
               console.error('Error updating company:', error);
               toast({
                 title: "Error",
                 description: "Failed to update company. Please try again.",
                 variant: "destructive",
               });
             }
           }}
         />
       )}
      </div>
    </div>
  );
 }