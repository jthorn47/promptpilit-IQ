import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnifiedTabNavigation, TabConfig } from "@/components/shared/UnifiedTabNavigation";
import { OverviewTab } from "@/components/shared/tabs/OverviewTab";
import { ContactsTab } from "@/components/shared/tabs/ContactsTab";
import { ServicesTab } from "@/components/shared/tabs/ServicesTab";
import { PropGENTab } from "@/components/shared/tabs/PropGENTab";
import { CompanyActivityTimeline } from "@/components/companies/CompanyActivityTimeline";
import { ModulesTab } from "@/components/shared/tabs/ModulesTab";

import { ArrowLeft, Building2, Calendar, Users, DollarSign, FileText, Edit, Settings, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type Company = Database['public']['Tables']['company_settings']['Row'];

export default function CompanyDetailPageSimple() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const [primaryContact, setPrimaryContact] = useState<any>(null);
  const [salesRep, setSalesRep] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchCompany();
    }
  }, [id]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      
      // Fetch company data
      const { data: companyData, error: companyError } = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (companyError) throw companyError;
      setCompany(companyData);

      // Fetch additional data if company exists
      if (companyData) {
        // Fetch latest risk assessment
        const { data: assessmentData } = await supabase
          .from('company_hr_assessments')
          .select('id, risk_score, risk_level, assessment_date, input_method, created_at')
          .eq('company_id', companyData.id)
          .order('assessment_date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        setRiskAssessment(assessmentData);

        // Fetch primary contact
        const { data: contactData } = await supabase
          .from('company_contacts')
          .select('first_name, last_name, email, phone')
          .eq('company_id', companyData.id)
          .eq('is_primary', true)
          .maybeSingle();
        
        setPrimaryContact(contactData);

        // Fetch sales rep profile if account_manager exists
        if (companyData.account_manager) {
          const { data: salesRepData } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('email', companyData.account_manager)
            .maybeSingle();
          
          setSalesRep(salesRepData);
        }
      }
    } catch (error: any) {
      console.error('Error fetching company:', error);
      toast({
        title: "Error",
        description: "Failed to fetch company details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskScoreColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRiskScoreIcon = (level: string) => {
    switch (level) {
      case 'low':
        return CheckCircle;
      case 'moderate':
        return AlertTriangle;
      case 'high':
        return Shield;
      default:
        return Shield;
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading company details...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Company not found</div>
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
            <BreadcrumbLink href="/admin/companies">Companies</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{company.company_name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/companies')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Building2 className="h-8 w-8" />
              {company.company_name}
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm text-muted-foreground">
                ID: {company.id.slice(0, 8)}...
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <Badge className={getStatusColor(company.subscription_status)} variant="outline">
                {company.subscription_status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/companies/edit/${id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => navigate(`/admin/companies/manage/${id}`)}>
            <Settings className="h-4 w-4 mr-2" />
            Manage
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Max Employees</p>
                <p className="text-2xl font-bold">
                  {company.max_employees}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-2xl font-bold">
                  {new Date(company.created_at).toLocaleDateString()}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Risk Score</p>
                {riskAssessment ? (
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">
                      {riskAssessment.risk_score}/100
                    </p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getRiskScoreColor(riskAssessment.risk_level)}`}
                    >
                      {riskAssessment.risk_level.toUpperCase()} RISK
                    </Badge>
                  </div>
                ) : (
                  <p className="text-lg font-bold text-muted-foreground">
                    Not Assessed
                  </p>
                )}
              </div>
              {(() => {
                const IconComponent = riskAssessment 
                  ? getRiskScoreIcon(riskAssessment.risk_level)
                  : Shield;
                return (
                  <IconComponent 
                    className={`h-8 w-8 ${
                      riskAssessment 
                        ? getRiskScoreColor(riskAssessment.risk_level)
                        : 'text-gray-400'
                    }`} 
                  />
                );
              })()}
            </div>
            {riskAssessment && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(riskAssessment.assessment_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agreement</p>
                <p className="text-2xl font-bold">
                  Active
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <UnifiedTabNavigation 
        tabs={getCompanyTabs()}
        defaultTab="overview"
        className="space-y-6"
      />
    </div>
  );

  function getCompanyTabs(): TabConfig[] {
    return [
      {
        id: "overview",
        label: "Overview",
        component: <OverviewTab data={{
          name: company?.company_name || '',
          status: company?.subscription_status || '',
          identifier: company?.id.slice(0, 8) + '...' || '',
          notes: company?.notes || 'Company settings and configuration',
          contractValue: company?.max_employees || 0,
          currency: 'employees',
          dateWon: company?.created_at || '',
          onboardingStatus: company?.lifecycle_stage || 'active',
          // Enhanced fields
          industry: company?.industry || undefined,
          headquarters: company?.city && company?.state ? `${company.city}, ${company.state}` : undefined,
          primaryContact: primaryContact ? `${primaryContact.first_name} ${primaryContact.last_name}` : undefined,
          salesRep: salesRep ? `${salesRep.first_name} ${salesRep.last_name}` : company?.account_manager || undefined,
          riskScore: riskAssessment?.risk_score || undefined,
          riskLevel: riskAssessment?.risk_level || undefined,
          dateCreated: company?.created_at || '',
          employeeCount: company?.employee_count || undefined,
          website: company?.website || undefined,
          totalEmployeesCovered: company?.max_employees || undefined,
          startDate: company?.onboarding_start_date || company?.payment_start_date || undefined,
          planType: company?.service_type || 'Basic',
          billingType: company?.subscription_status === 'trial' ? 'Trial' : 'Subscription',
          servicesPurchased: company?.service_type ? [company.service_type] : ['LMS'],
          lifecycleStage: company?.lifecycle_stage || undefined,
          additionalInfo: {
            maxEmployees: company?.max_employees || 0,
            emailNotifications: company?.email_notifications || false,
            primaryColor: company?.primary_color || '',
            certificateTemplate: company?.certificate_template || ''
          }
        }} type="company" />
      },
      {
        id: "contacts",
        label: "Contacts",
        component: <ContactsTab companyId={id!} readonly={false} />
      },
      {
        id: "services",
        label: "Services",
        component: <ServicesTab services={['Training Management', 'Employee Onboarding', 'Compliance Tracking', 'Certificate Generation']} readonly />
      },
      {
        id: "propgen",
        label: "PropGEN",
        component: <PropGENTab companyId={company?.id || ''} companyName={company?.company_name || ''} />
      },
      {
        id: "activities",
        label: "Activities",
        component: <CompanyActivityTimeline 
          companyId={company?.id || ''} 
          companyName={company?.company_name || ''} 
          clientType={company?.client_type}
        />
      },
      {
        id: "modules",
        label: "Modules",
        component: <div className="text-center py-12">
          <p className="text-muted-foreground">Platform modules have been removed</p>
        </div>
      }
    ];
  }
}