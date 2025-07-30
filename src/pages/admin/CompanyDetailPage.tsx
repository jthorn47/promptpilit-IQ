import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Building2, Users, Calendar, Settings, Trash2, MapPin, Phone, Mail, DollarSign, Globe, User } from "lucide-react";
import { ProfileEmailButton } from "@/components/email/ProfileEmailButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompanies } from "@/hooks/useCompanies";
import { ContactsTab } from "@/components/shared/tabs/ContactsTab";
import { PropGENTab } from "@/components/shared/tabs/PropGENTab";
import { CompanyActivityTimeline } from "@/components/companies/CompanyActivityTimeline";
import { WorkflowStatusIndicators } from "@/components/companies/WorkflowStatusIndicators";
import { ActivityFeedTile } from "@/components/shared/ActivityFeedTile";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface PrimaryContact {
  first_name: string;
  last_name: string;
  job_title?: string;
  email?: string;
  phone?: string;
}


interface Company {
  id: string;
  company_name: string;
  max_employees: number;
  subscription_status: string;
  created_at: string;
  updated_at: string;
  primary_color: string;
  email_notifications: boolean;
  certificate_template: string;
  company_logo_url?: string;
  sales_lifecycle_stage?: string;
  client_type?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  website?: string;
  timezone?: string;
  company_owner_name?: string;
  bdm?: string;
  recruiter?: string;
  business_description?: string;
  internal_notes?: string;
  ein?: string;
  primary_contact_phone?: string;
  phone?: string;
  account_manager?: string;
  contract_value?: number;
  currency?: string;
  employee_count?: number;
  service_type?: string;
  industry?: string;
  current_risk_score?: number;
  last_assessment_date?: string;
}

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { deleteCompany } = useCompanies();
  const [company, setCompany] = useState<Company | null>(null);
  const [primaryContact, setPrimaryContact] = useState<PrimaryContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useIsMobile();

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

  const handleDeleteCompany = async () => {
    if (!company || !id) return;
    
    const success = await deleteCompany(id, () => {
      // Navigate back to companies list after successful deletion
      navigate('/admin/companies');
    });
  };

  useEffect(() => {
    if (id) {
      fetchCompany(id);
    }
  }, [id]);

  const fetchCompany = async (companyId: string) => {
    try {
      console.log('🔍 Fetching company data for ID:', companyId);
      setLoading(true);
      
      // Fetch company data
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', companyId)
        .maybeSingle();

      console.log('📊 Company data received:', data);
      console.log('❌ Any errors:', error);

      if (error) {
        console.error('Database error:', error);
        toast({
          title: "Error",
          description: "Failed to fetch company details",
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        console.log('No company found');
        toast({
          title: "Not Found",
          description: "Company not found",
          variant: "destructive",
        });
        navigate('/admin/companies');
        return;
      }

      console.log('✅ Setting company state with data');
      setCompany(data);
      
      // Fetch primary contact
      fetchPrimaryContact(companyId);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error", 
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPrimaryContact = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('company_contacts')
        .select('first_name, last_name, job_title, email, phone')
        .eq('company_id', companyId)
        .eq('is_primary', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching primary contact:', error);
        return;
      }

      if (data) {
        setPrimaryContact(data);
      }
    } catch (error) {
      console.error('Unexpected error fetching primary contact:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      case 'premium': return 'outline';
      default: return 'destructive';
    }
  };

  const getAgreementStatus = (lifecycleStage?: string) => {
    if (!lifecycleStage) return { status: 'Not Active', variant: 'destructive' as const };
    
    switch (lifecycleStage) {
      case 'client_active':
      case 'active_paying_client':
        return { status: 'Active', variant: 'default' as const };
      case 'client_premium':
        return { status: 'Premium', variant: 'outline' as const };
      case 'client_inactive':
      case 'dormant_churned':
        return { status: 'Inactive', variant: 'destructive' as const };
      default:
        return { status: 'Pending', variant: 'secondary' as const };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFullAddress = (company: Company) => {
    const parts = [
      company.address,
      company.city,
      company.state,
      company.postal_code
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const getRiskLevel = (riskScore?: number) => {
    if (!riskScore) return { level: 'Not Assessed', color: 'text-muted-foreground', bgColor: 'bg-muted' };
    
    if (riskScore <= 30) {
      return { level: 'Low Risk', color: 'text-success', bgColor: 'bg-success/10' };
    } else if (riskScore <= 70) {
      return { level: 'Medium Risk', color: 'text-warning', bgColor: 'bg-warning/10' };
    } else {
      return { level: 'High Risk', color: 'text-danger', bgColor: 'bg-danger/10' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Company Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              The requested company could not be found.
            </p>
            <Button 
              className="w-full mt-4" 
              onClick={() => navigate('/admin/companies')}
            >
              Back to Companies
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn("flex items-center justify-between", isMobile && "company-header-mobile")}>
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/admin/companies')}
            className={cn(isMobile && "mobile-button-sm")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">{company.company_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-muted-foreground">Company Profile</p>
                {company.sales_lifecycle_stage === 'client_active' && (
                  <Badge className="bg-gradient-to-r from-emerald-50 to-green-100 text-green-700 border-green-300 shadow-sm">
                    💰 Active Client
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={cn("flex items-center space-x-2", isMobile && "company-header-mobile-actions")}>
          <ProfileEmailButton
            mode="company"
            companyId={company.id}
            prefilledSubject={`Regarding ${company.company_name}`}
            size="sm"
          />
          
          <Button 
            variant="outline" 
            onClick={() => navigate(`/admin/companies/edit/${id}`)}
            className={cn(isMobile && "mobile-button")}
          >
            <Settings className="h-4 w-4 mr-2" />
            Edit Company
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline"
                className={cn(isMobile && "mobile-button")}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Company</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{company.company_name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteCompany}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Company Info Cards */}
      <div className={cn(
        "grid gap-4", 
        isMobile ? "company-info-grid-mobile" : "grid-cols-1 md:grid-cols-5 gap-6"
      )}>
        <Card className={cn("bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200", isMobile && "company-info-card-mobile")}>
          <CardHeader className={cn("pb-3", isMobile && "pb-2 px-3 pt-3")}>
            <CardTitle className={cn("text-sm font-medium text-blue-700", isMobile && "text-xs")}>
              Number of Employees
            </CardTitle>
          </CardHeader>
          <CardContent className={cn(isMobile && "p-3 pt-0")}>
            <div className="flex items-center justify-between">
              <span className={cn("text-2xl font-bold text-blue-800", isMobile && "text-lg")}>
                {company.max_employees}
              </span>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("bg-gradient-to-br from-green-50 to-emerald-100 border-green-200", isMobile && "company-info-card-mobile")}>
          <CardHeader className={cn("pb-3", isMobile && "pb-2 px-3 pt-3")}>
            <CardTitle className={cn("text-sm font-medium text-green-700", isMobile && "text-xs")}>
              Created Date
            </CardTitle>
          </CardHeader>
          <CardContent className={cn(isMobile && "p-3 pt-0")}>
            <div className="flex items-center justify-between">
              <span className={cn("text-sm font-semibold text-green-800", isMobile && "text-xs")}>
                {formatDate(company.created_at)}
              </span>
              <div className="p-2 bg-green-100 rounded-full">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200", isMobile && "company-info-card-mobile")}>
          <CardHeader className={cn("pb-3", isMobile && "pb-2 px-3 pt-3")}>
            <CardTitle className={cn("text-sm font-medium text-orange-700", isMobile && "text-xs")}>
              Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent className={cn(isMobile && "p-3 pt-0")}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className={cn("text-2xl font-bold text-orange-800", isMobile && "text-lg")}>
                  {company.current_risk_score || '--'}
                </span>
                {company.current_risk_score && (
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      getRiskLevel(company.current_risk_score).bgColor,
                      getRiskLevel(company.current_risk_score).color
                    )}>
                      {getRiskLevel(company.current_risk_score).level}
                    </div>
                  </div>
                )}
                {company.last_assessment_date && (
                  <p className="text-xs text-orange-600 mt-1">
                    Last assessed: {formatDate(company.last_assessment_date)}
                  </p>
                )}
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <Building2 className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200", isMobile && "company-info-card-mobile")}>
          <CardHeader className={cn("pb-3", isMobile && "pb-2 px-3 pt-3")}>
            <CardTitle className={cn("text-sm font-medium text-purple-700", isMobile && "text-xs")}>
              Sales Lifecycle Status
            </CardTitle>
          </CardHeader>
          <CardContent className={cn(isMobile && "p-3 pt-0")}>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className={cn("bg-purple-100 text-purple-800 border-purple-300 text-sm font-medium", isMobile && "text-xs")}>
                {company.sales_lifecycle_stage?.replace('_', ' ') || 'prospect'}
              </Badge>
              <div className="p-2 bg-purple-100 rounded-full">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <ActivityFeedTile
          entityType="company"
          entityId={company.id}
          entityName={company.company_name}
          showChildren={true}
          onViewAll={switchToActivitiesTab}
          className={cn(isMobile && "company-info-card-mobile")}
        />
      </div>

      {/* Main Content - Horizontal Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className={cn(isMobile && "company-tabs-mobile")}>
          <TabsList className={cn(
            "grid w-full",
            isMobile ? "grid-cols-2 gap-1 h-auto p-1" : "grid-cols-9"
          )}>
            <TabsTrigger value="overview" className={cn(
              isMobile && "company-tab-trigger text-xs px-2 py-1.5"
            )}>
              {isMobile ? "Info" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="contacts" className={cn(
              isMobile && "company-tab-trigger text-xs px-2 py-1.5"
            )}>
              Contacts
            </TabsTrigger>
            <TabsTrigger value="activities" className={cn(
              isMobile && "company-tab-trigger text-xs px-2 py-1.5"
            )}>
              {isMobile ? "Activity" : "Activities"}
            </TabsTrigger>
            <TabsTrigger value="services" className={cn(
              isMobile && "company-tab-trigger text-xs px-2 py-1.5"
            )}>
              Services
            </TabsTrigger>
            <TabsTrigger value="propgen" className={cn(
              isMobile && "company-tab-trigger text-xs px-2 py-1.5"
            )}>
              PropGEN
            </TabsTrigger>
            <TabsTrigger value="modules" className={cn(
              isMobile && "company-tab-trigger text-xs px-2 py-1.5"
            )}>
              Modules
            </TabsTrigger>
            <TabsTrigger value="notes" className={cn(
              isMobile && "company-tab-trigger text-xs px-2 py-1.5"
            )}>
              Notes
            </TabsTrigger>
            <TabsTrigger value="email" className={cn(
              isMobile && "company-tab-trigger text-xs px-2 py-1.5"
            )}>
              Email
            </TabsTrigger>
            <TabsTrigger value="integrations" className={cn(
              isMobile && "company-tab-trigger text-xs px-2 py-1.5"
            )}>
              Integrations
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="space-y-6">
          <div className={cn(
            "grid gap-6",
            isMobile ? "grid-cols-1 gap-4" : "grid-cols-1 md:grid-cols-2"
          )}>
            {/* Company Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                  <p className="font-medium">{company.company_name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Company Address
                  </label>
                  <p className="font-medium">{formatFullAddress(company) || 'No address provided'}</p>
                </div>
                
                {company.website && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Website
                    </label>
                    <a 
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Number of Employees
                  </label>
                  <p className="font-medium">{company.max_employees}</p>
                </div>

                {company.industry && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Industry
                    </label>
                    <p className="font-medium">{company.industry}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sales Lifecycle Stage</label>
                  <div className="mt-1">
                    <Badge className="bg-blue-100 text-blue-800">
                      {company.sales_lifecycle_stage?.replace('_', ' ') || 'prospect'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {primaryContact ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Primary Contact Name</label>
                      <p className="font-medium">{primaryContact.first_name} {primaryContact.last_name}</p>
                    </div>
                    
                    {primaryContact.job_title && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Title</label>
                        <p className="font-medium">{primaryContact.job_title}</p>
                      </div>
                    )}
                    
                    {primaryContact.email && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Email
                        </label>
                        <a 
                          href={`mailto:${primaryContact.email}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {primaryContact.email}
                        </a>
                      </div>
                    )}
                    
                    {primaryContact.phone && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Phone
                        </label>
                        <a 
                          href={`tel:${primaryContact.phone}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {primaryContact.phone}
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No primary contact found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Add a primary contact in the Contacts tab
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>


          {/* Contract Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.contract_value && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Estimated Gross Profit</label>
                    <p className="font-medium">
                      {company.currency || 'USD'} {company.contract_value.toLocaleString()}
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Employees Covered</label>
                  <p className="font-medium">{company.max_employees}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Billing Type</label>
                  <div className="mt-1">
                    <Badge variant={getStatusBadgeVariant(company.subscription_status)} className="text-sm">
                      {company.subscription_status}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Services Purchased</label>
                  <p className="font-medium">
                    {company.service_type ? company.service_type.toUpperCase() : 'None yet'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Agreement Status</label>
                  <div className="mt-1">
                    {(() => {
                      const { status, variant } = getAgreementStatus(company.sales_lifecycle_stage);
                      return (
                        <Badge variant={variant} className="text-sm">
                          {status}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                  <p className="font-medium">{formatDate(company.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
        </TabsContent>


        <TabsContent value="contacts">
          <ContactsTab companyId={company.id} />
        </TabsContent>

        <TabsContent value="activities">
          <CompanyActivityTimeline 
            companyId={company.id} 
            companyName={company.company_name}
            clientType={company.client_type}
          />
        </TabsContent>


        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Services
              </CardTitle>
              <CardDescription>
                Manage company services and subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Services management coming soon</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This section will show active services, subscription details, and billing information
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="propgen">
          <PropGENTab companyId={id!} companyName={company.company_name} />
        </TabsContent>

        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Modules
              </CardTitle>
              <CardDescription>
                Company-specific modules and configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Modules management coming soon</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This section will display active modules, configurations, and module-specific settings
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Notes
              </CardTitle>
              <CardDescription>
                Internal notes and communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Notes system coming soon</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This section will allow adding and managing internal notes about the company
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Management
              </CardTitle>
              <CardDescription>
                Connect and manage Office 365 email integration for {company.company_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Email integration setup</p>
                <p className="text-sm text-muted-foreground mt-2 mb-4">
                  Connect your Office 365 account to manage emails directly from this interface
                </p>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">Office 365 Integration</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      To access the full email management features, please navigate to Connect IQ → Email Dashboard
                    </p>
                    <Button 
                      onClick={() => navigate('/admin/crm')}
                      className="w-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Go to Connect IQ Email Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Integrations
              </CardTitle>
              <CardDescription>
                Third-party integrations and API connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Integrations management coming soon</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This section will show active integrations, API configurations, and connection status
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}