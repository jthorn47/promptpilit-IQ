import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { UnifiedTabNavigation, TabConfig } from "@/components/shared/UnifiedTabNavigation";
import { OverviewTab } from "@/components/shared/tabs/OverviewTab";
import { ContactsTab } from "@/components/shared/tabs/ContactsTab";
import { ContractTab } from "@/components/shared/tabs/ContractTab";
import { ActivitiesTab } from "@/components/shared/tabs/ActivitiesTab";
import { ModulesTab } from "@/components/shared/tabs/ModulesTab";
import { PropGENTab } from "@/components/shared/tabs/PropGENTab";
import { HaaLOIQTab } from "@/components/shared/tabs/HaaLOIQTab";
import { HaloPayrollTab } from "@/components/shared/tabs/HaloPayrollTab";
import { EmployeesTab } from "@/components/shared/tabs/EmployeesTab";
import { TimeComplianceTab } from "@/components/shared/tabs/TimeComplianceTab";
import { ComplianceDashboardTab } from "@/components/shared/tabs/ComplianceDashboardTab";
import { LocationRulesTab } from "@/components/shared/tabs/LocationRulesTab";
import { KioskSettingsTab } from "@/components/shared/tabs/KioskSettingsTab";
import { ArrowLeft, Building, Calendar, User, Users, DollarSign, FileText, Phone, Mail, MapPin, Edit, Settings, Calculator, Shield, BookOpen, Clock, CreditCard, UserCheck, GraduationCap, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { ActivityFeedTile } from "@/components/shared/ActivityFeedTile";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type Client = Database['public']['Tables']['clients']['Row'];

export const ClientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isSuperAdmin } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get initial tab from URL parameter or default to overview
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const { toast } = useToast();

  const switchToActivitiesTab = useCallback(() => {
    setActiveTab('activities');
  }, []);

  const triggerCreateActivity = useCallback(() => {
    switchToActivitiesTab();
    // Add a small delay to ensure tab is switched before triggering create
    setTimeout(() => {
      const createButton = document.querySelector('[data-activity-create]') as HTMLButtonElement;
      createButton?.click();
    }, 100);
  }, [switchToActivitiesTab]);

  useEffect(() => {
    if (clientId) {
      fetchClient();
    }
  }, [clientId]);
  
  // Update URL when tab changes
  useEffect(() => {
    if (activeTab !== 'overview') {
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set('tab', activeTab);
      navigate(`/admin/crm/clients/${clientId}?${newSearchParams.toString()}`, { replace: true });
    } else {
      // Remove tab parameter if it's the default tab
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.delete('tab');
      const queryString = newSearchParams.toString();
      navigate(`/admin/crm/clients/${clientId}${queryString ? `?${queryString}` : ''}`, { replace: true });
    }
  }, [activeTab, clientId, navigate]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();

      if (error) throw error;
      setClient(data);
    } catch (error: any) {
      console.error('Error fetching client:', error);
      toast({
        title: "Error",
        description: "Failed to fetch client details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'premium':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'trial':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getOnboardingStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getOnboardingStatusText = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading client details...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Client not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/crm">CRM</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/crm/clients">Clients</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{client.company_name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/crm/clients')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center shadow-lg">
              <Building className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
                {client.company_name}
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-muted-foreground">
                  Client #{client.client_number || 'Pending'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                <Badge className={`shadow-sm font-medium ${getStatusColor(client.status)}`} variant="outline">
                  {client.status}
                </Badge>
                <Badge className={`shadow-sm font-medium ${getOnboardingStatusColor(client.onboarding_status)}`} variant="outline">
                  {getOnboardingStatusText(client.onboarding_status)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex items-center justify-center">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" className="flex items-center justify-center">
            <Settings className="h-4 w-4 mr-2" />
            Manage
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contract Value</p>
                <p className="text-2xl font-bold text-green-800">
                  {client.currency} {client.contract_value.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Date Won</p>
                <p className="text-2xl font-bold text-blue-800">
                  {new Date(client.date_won).toLocaleDateString()}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-bold text-purple-800">
                  {client.status}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <ActivityFeedTile
          entityType="client"
          entityId={client.id}
          entityName={client.company_name}
          showChildren={false}
          onViewAll={switchToActivitiesTab}
        />
      </div>

      {/* Detailed Information - Single Row Tab Layout */}
      <div className="w-full">
        {/* Single row with all tabs */}
        <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'overview'
                ? 'bg-background text-foreground shadow'
                : 'hover:bg-background/50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'contacts'
                ? 'bg-background text-foreground shadow'
                : 'hover:bg-background/50'
            }`}
          >
            Contacts
          </button>
          <button
            onClick={() => setActiveTab('contract')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'contract'
                ? 'bg-background text-foreground shadow'
                : 'hover:bg-background/50'
            }`}
          >
            Contract
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'activities'
                ? 'bg-background text-foreground shadow'
                : 'hover:bg-background/50'
            }`}
          >
            Activities
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'modules'
                ? 'bg-background text-foreground shadow'
                : 'hover:bg-background/50'
            }`}
          >
            Modules
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'employees'
                ? 'bg-background text-foreground shadow'
                : 'hover:bg-background/50'
            }`}
          >
            Employees
          </button>
          <button
            onClick={() => setActiveTab('halo-payroll')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'halo-payroll'
                ? 'bg-background text-foreground shadow'
                : 'hover:bg-background/50'
            }`}
          >
            Halo Payroll IQ Settings
          </button>
          <button
            onClick={() => setActiveTab('time-compliance')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'time-compliance'
                ? 'bg-background text-foreground shadow'
                : 'hover:bg-background/50'
            }`}
          >
            Time Compliance
          </button>
          <button
            onClick={() => setActiveTab('compliance-dashboard')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'compliance-dashboard'
                ? 'bg-background text-foreground shadow'
                : 'hover:bg-background/50'
            }`}
          >
            Compliance Dashboard
          </button>
          <button
            onClick={() => setActiveTab('location-rules')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'location-rules'
                ? 'bg-background text-foreground shadow'
                : 'hover:bg-background/50'
            }`}
          >
            Location Rules
          </button>
          <button
            onClick={() => setActiveTab('kiosk-settings')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === 'kiosk-settings'
                ? 'bg-background text-foreground shadow'
                : 'hover:bg-background/50'
            }`}
          >
            Kiosk Settings
          </button>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );

  function renderTabContent() {
    const tabs = getClientTabs();
    const currentTab = tabs.find(tab => tab.id === activeTab);
    return currentTab ? <div className="mt-6">{currentTab.component}</div> : null;
  }

  function getClientTabs(): TabConfig[] {
    return [
      {
        id: "overview",
        label: "Overview",
        component: <OverviewTab data={{
          name: client?.company_name || '',
          status: client?.status || '',
          identifier: client?.client_number || '',
          notes: client?.notes || '',
          contractValue: client?.contract_value || 0,
          currency: client?.currency || 'USD',
          dateWon: client?.date_won || '',
          onboardingStatus: client?.onboarding_status || '',
          additionalInfo: {
            accountManager: client?.account_manager || '',
            contractStartDate: client?.contract_start_date || '',
            contractEndDate: client?.contract_end_date || ''
          }
        }} type="client" clientId={client?.id} />
      },
      {
        id: "employees",
        label: "Employees", 
        component: <EmployeesTab clientId={client?.company_settings_id || ''} />
      },
      {
        id: "contacts",
        label: "Contacts",
        component: <ContactsTab companyId={client?.company_settings_id || ''} readonly={true} />
      },
      {
        id: "contract",
        label: "Contract",
        component: <ContractTab data={{
          contractValue: client?.contract_value || 0,
          currency: client?.currency || 'USD',
          startDate: client?.contract_start_date || '',
          endDate: client?.contract_end_date || '',
          originalDealOwner: client?.original_deal_owner || '',
          dateWon: client?.date_won || ''
        }} readonly />
      },
      {
        id: "activities",
        label: "Activities",
        component: <ActivitiesTab activities={[]} readonly />
      },
      {
        id: "modules",
        label: "Modules",
        component: <ModulesTab modules={[]} readonly clientId={client?.id} />
      },
      {
        id: "halo-payroll",
        label: "Halo Payroll",
        component: <HaloPayrollTab clientId={client?.id || ''} companyId={client?.company_settings_id || ''} />
      },
      {
        id: "time-compliance",
        label: "Time Compliance",
        component: <TimeComplianceTab clientId={client?.company_settings_id || ''} />
      },
      {
        id: "compliance-dashboard",
        label: "Compliance Dashboard",
        component: <ComplianceDashboardTab clientId={client?.company_settings_id || ''} />
      },
      {
        id: "location-rules",
        label: "Location Rules",
        component: <LocationRulesTab clientId={client?.company_settings_id || ''} />
      },
      {
        id: "kiosk-settings",
        label: "Kiosk Settings", 
        component: <KioskSettingsTab companyId={client?.company_settings_id || ''} />
      }
    ];
  }
};