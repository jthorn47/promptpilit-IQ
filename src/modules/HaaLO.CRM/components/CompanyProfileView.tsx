import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useBreakpoint } from "@/hooks/use-mobile.tsx";
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  DollarSign,
  FileText,
  TrendingUp,
  Target,
  CheckCircle,
  Plus,
  Edit,
  ChevronDown
} from "lucide-react";
import { ProfileEmailButton } from '@/components/email/ProfileEmailButton';

interface Company {
  id: string;
  company_name: string;
  industry?: string;
  company_size?: string;
  lifecycle_stage?: string;
  contract_value?: number;
  business_description?: string;
  website?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  employee_count?: number;
  created_at: string;
  updated_at: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  title?: string;
  is_primary: boolean;
}

interface Opportunity {
  id: string;
  title: string;
  value?: number;
  stage: string;
  probability?: number;
  close_date?: string;
  spin_situation?: string;
  spin_problem?: string;
  spin_implication?: string;
  spin_need_payoff?: string;
}

export const CompanyProfileView = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile } = useBreakpoint();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editing, setEditing] = useState(false);

  // Tab configuration
  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "contacts", label: "Contacts" },
    { value: "opportunities", label: "Opportunities" },
    { value: "risk", label: "Risk Assessments" },
    { value: "spin", label: "SPIN Selling" },
    { value: "proposals", label: "Proposals" },
    { value: "tasks", label: "Tasks" },
    { value: "activity", label: "Notes & Activity" }
  ];

  useEffect(() => {
    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId]);

  const fetchCompanyData = async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      
      // Fetch company details
      const { data: companyData, error: companyError } = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', companyId)
        .single();

      if (companyError) throw companyError;
      
      setCompany({
        id: companyData.id,
        company_name: companyData.company_name,
        industry: companyData.industry,
        company_size: String(companyData.employee_count || 'Unknown'),
        lifecycle_stage: companyData.lifecycle_stage,
        contract_value: companyData.contract_value,
        business_description: companyData.business_description || '',
        website: companyData.website,
        phone: companyData.phone,
        city: companyData.city,
        state: companyData.state,
        country: companyData.country,
        employee_count: companyData.employee_count,
        created_at: companyData.created_at,
        updated_at: companyData.updated_at
      });

      // Fetch company contacts (mock for now - would need actual contacts table)
      const mockContacts: Contact[] = [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@company.com',
          phone: '+1-555-0123',
          title: 'CEO',
          is_primary: true
        }
      ];
      setContacts(mockContacts);

      // Fetch opportunities (mock for now - would connect to actual deals table)
      const mockOpportunities: Opportunity[] = [
        {
          id: '1',
          title: 'HRO Conversion',
          value: 18500,
          stage: 'Proposal Sent',
          probability: 70,
          close_date: '2025-08-12',
          spin_situation: 'Client uses Gusto for payroll with no HRIS.',
          spin_problem: "They've missed multiple compliance deadlines.",
          spin_implication: 'Legal and financial risk exposure increasing.',
          spin_need_payoff: 'Switching to our ASO would reduce risk + admin time.'
        }
      ];
      setOpportunities(mockOpportunities);

    } catch (error: any) {
      console.error('Error fetching company data:', error);
      toast({
        title: "Error",
        description: "Failed to load company data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (updates: Partial<Company>) => {
    if (!company) return;

    try {
      const { error } = await supabase
        .from('company_settings')
        .update(updates)
        .eq('id', company.id);

      if (error) throw error;

      setCompany({ ...company, ...updates });
      toast({
        title: "Success",
        description: "Company updated successfully"
      });
      setEditing(false);
    } catch (error: any) {
      toast({
        title: "Error", 
        description: "Failed to update company",
        variant: "destructive"
      });
    }
  };

  const getRiskScore = () => {
    // Mock risk score calculation
    return 87;
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: 'High', color: 'bg-red-500', icon: '🔥' };
    if (score >= 60) return { label: 'Medium', color: 'bg-yellow-500', icon: '⚠️' };
    return { label: 'Low', color: 'bg-green-500', icon: '✅' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading company data...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Company not found</h2>
        <Button onClick={() => navigate('/admin/crm/companies')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>
      </div>
    );
  }

  const riskScore = getRiskScore();
  const riskLevel = getRiskLevel(riskScore);

  return (
    <div className="space-y-6">
      {/* Company Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/admin/connectiq/companies')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold truncate">{company.company_name}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ProfileEmailButton
            mode="company"
            companyId={companyId}
            prefilledSubject={`Re: ${company.company_name}`}
            variant="outline"
            size="default"
            className="min-w-fit"
          />
          <Button onClick={() => setEditing(!editing)} className="flex-shrink-0">
            <Edit className="h-4 w-4 mr-2" />
            {editing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
      </div>

      {/* Responsive Tabs - Desktop Tabs / Mobile Dropdown */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {isMobile ? (
          /* Mobile: Dropdown Tab Selector */
          <div className="w-full">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-2 border-border z-50 shadow-sm">
                <SelectValue>
                  {tabs.find(tab => tab.value === activeTab)?.label || "Select Tab"}
                </SelectValue>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </SelectTrigger>
              <SelectContent className="w-full bg-white dark:bg-gray-800 border-2 border-border shadow-lg z-50 max-h-60 overflow-y-auto">
                {tabs.map((tab) => (
                  <SelectItem 
                    key={tab.value} 
                    value={tab.value} 
                    className="cursor-pointer hover:bg-muted focus:bg-muted bg-white dark:bg-gray-800"
                  >
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          /* Desktop: Traditional Tabs */
          <div className="w-full overflow-x-auto">
            <TabsList className="inline-flex w-max min-w-full">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="whitespace-nowrap">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        )}

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Company Name</label>
                      {editing ? (
                        <Input 
                          value={company.company_name} 
                          onChange={(e) => setCompany({...company, company_name: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{company.company_name}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      {editing ? (
                        <Select value={company.lifecycle_stage} onValueChange={(value) => setCompany({...company, lifecycle_stage: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="prospect">Prospect</SelectItem>
                            <SelectItem value="client">Client</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="secondary">{company.lifecycle_stage || 'Prospect'}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Industry</label>
                      {editing ? (
                        <Input 
                          value={company.industry || ''} 
                          onChange={(e) => setCompany({...company, industry: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{company.industry || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Risk Score</label>
                      <div className="flex items-center gap-2">
                        <Badge className={riskLevel.color}>{riskScore}</Badge>
                        <span className="text-sm">{riskLevel.icon} {riskLevel.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <p className="text-sm text-muted-foreground">HRO</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Assigned Rep</label>
                      <p className="text-sm text-muted-foreground">Sarah Liu</p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Contact Info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Business Description</label>
                    {editing ? (
                      <Textarea 
                        value={company.business_description || ''} 
                        onChange={(e) => setCompany({...company, business_description: e.target.value})}
                        placeholder="Enter business description..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {company.business_description || 'No description available'}
                      </p>
                    )}
                  </div>

                  {editing && (
                    <div className="flex gap-2">
                      <Button onClick={() => updateCompany({
                        company_name: company.company_name,
                        industry: company.industry,
                        lifecycle_stage: company.lifecycle_stage,
                        business_description: company.business_description
                      })}>
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Quick Actions */}
              <div>
                <h4 className="font-medium mb-4">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="flex-shrink-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                  <Button variant="outline" size="sm" className="flex-shrink-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Opportunity
                  </Button>
                  <Button variant="outline" size="sm" className="flex-shrink-0">
                    <FileText className="h-4 w-4 mr-2" />
                    View Risk Assessment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Contacts</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="p-4 border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium flex flex-wrap items-center gap-2">
                            <span className="truncate">{contact.first_name} {contact.last_name}</span>
                            {contact.is_primary && <Badge className="flex-shrink-0" variant="secondary">Primary</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">{contact.title}</div>
                          <div className="text-sm text-muted-foreground break-all">{contact.email}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end sm:justify-start">
                        <Button variant="outline" size="sm" className="flex-shrink-0">
                          <Mail className="h-4 w-4" />
                          <span className="sr-only">Email</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-shrink-0">
                          <Phone className="h-4 w-4" />
                          <span className="sr-only">Call</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Opportunities</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Opportunity
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">{opp.title}</h4>
                        <p className="text-sm text-muted-foreground">Stage: {opp.stage}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${opp.value?.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{opp.probability}% close probability</div>
                      </div>
                    </div>
                    
                    {/* SPIN Preview */}
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <h5 className="font-medium mb-2">SPIN Selling Preview</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">📌 Situation:</span> {opp.spin_situation}
                        </div>
                        <div>
                          <span className="font-medium">🔥 Problem:</span> {opp.spin_problem}
                        </div>
                        <div>
                          <span className="font-medium">🚨 Implication:</span> {opp.spin_implication}
                        </div>
                        <div>
                          <span className="font-medium">💰 Need-Payoff:</span> {opp.spin_need_payoff}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Assessments Tab */}
        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Risk Assessment Integration</h3>
                <p className="text-muted-foreground mb-4">
                  Connect with risk assessment tools to display compliance scores and recommendations
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Run Risk Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SPIN Selling Tab */}
        <TabsContent value="spin">
          <Card>
            <CardHeader>
              <CardTitle>SPIN Selling Analysis</CardTitle>
              <CardDescription>Cross-opportunity SPIN selling insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">SPIN Selling Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive SPIN analysis across all opportunities for this company
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Start SPIN Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Proposals Tab */}
        <TabsContent value="proposals">
          <Card>
            <CardHeader>
              <CardTitle>Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">PropGEN Integration</h3>
                <p className="text-muted-foreground mb-4">
                  Access proposal generation tools and track proposal status
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Proposal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Tasks & Follow-ups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Contextual Task Management</h3>
                <p className="text-muted-foreground mb-4">
                  Tasks and follow-ups related to this company
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes & Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Notes & Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Activity Timeline</h3>
                <p className="text-muted-foreground mb-4">
                  Complete timeline of interactions, notes, and activities
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};