import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Send, Building2, Calculator, Shield, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import InvestmentAnalysisCalculator from '@/components/proposals/InvestmentAnalysisCalculator';
import ProposalPreview from '@/components/proposals/ProposalPreview';

interface Company {
  id: string;
  company_name: string;
  max_employees: number;
  primary_color: string;
  company_logo_url?: string;
}

interface Assessment {
  id: string;
  company_name: string;
  risk_score: number;
  risk_level: string;
  responses: any;
}

interface ProposalData {
  title: string;
  company_id: string;
  include_investment_analysis: boolean;
  include_risk_assessment: boolean;
  include_recommendations: boolean;
  proposal_data: any;
  brand_settings: any;
  financial_data: any;
}

export default function ProposalBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  
  const [proposalData, setProposalData] = useState<ProposalData>({
    title: '',
    company_id: '',
    include_investment_analysis: true,
    include_risk_assessment: true,
    include_recommendations: true,
    proposal_data: {},
    brand_settings: {
      primary_color: '#655DC6',
      show_logo: true,
      show_company_info: true
    },
    financial_data: {}
  });

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [investmentResults, setInvestmentResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('setup');

  useEffect(() => {
    fetchCompanies();
    fetchAssessments();
    if (isEditing) {
      fetchProposal();
    }
  }, [id, isEditing]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('id, company_name, max_employees, primary_color, company_logo_url')
        .order('company_name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch companies',
        variant: 'destructive',
      });
    }
  };

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, company_name, risk_score, risk_level, responses')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error: any) {
      console.error('Error fetching assessments:', error);
    }
  };

  const fetchProposal = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setProposalData({
        title: data.title,
        company_id: data.company_id,
        include_investment_analysis: data.include_investment_analysis,
        include_risk_assessment: data.include_risk_assessment,
        include_recommendations: data.include_recommendations,
        proposal_data: data.proposal_data || {},
        brand_settings: data.brand_settings || { primary_color: '#655DC6', show_logo: true, show_company_info: true },
        financial_data: data.financial_data || {}
      });

      // Set selected company
      const company = companies.find(c => c.id === data.company_id);
      if (company) {
        setSelectedCompany(company);
        // Find matching assessment
        const assessment = assessments.find(a => 
          a.company_name.toLowerCase() === company.company_name.toLowerCase()
        );
        setSelectedAssessment(assessment || null);
      }
    } catch (error: any) {
      console.error('Error fetching proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch proposal',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    setSelectedCompany(company || null);
    
    // Find matching assessment
    if (company) {
      const assessment = assessments.find(a => 
        a.company_name.toLowerCase() === company.company_name.toLowerCase()
      );
      setSelectedAssessment(assessment || null);
      
      // Update brand settings with company colors
      setProposalData(prev => ({
        ...prev,
        company_id: companyId,
        brand_settings: {
          ...prev.brand_settings,
          primary_color: company.primary_color || '#655DC6'
        }
      }));
    }
  };

  const handleSave = async (status: 'draft' | 'sent' = 'draft') => {
    if (!proposalData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a proposal title',
        variant: 'destructive',
      });
      return;
    }

    if (!proposalData.company_id) {
      toast({
        title: 'Error',
        description: 'Please select a company',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      const proposalPayload = {
        ...proposalData,
        status,
        created_by: user?.id,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('proposals')
          .update(proposalPayload)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('proposals')
          .insert([proposalPayload]);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `Proposal ${status === 'sent' ? 'sent' : 'saved'} successfully`,
      });

      navigate('/admin/proposals');
    } catch (error: any) {
      console.error('Error saving proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to save proposal',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading proposal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/admin/proposals')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Proposals
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Edit Proposal' : 'Create Proposal'}
          </h1>
          <p className="text-muted-foreground">Build a comprehensive HR service proposal</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Proposal Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Proposal Title</Label>
                <Input
                  id="title"
                  value={proposalData.title}
                  onChange={(e) => setProposalData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter proposal title..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Select Company</Label>
                <Select 
                  value={proposalData.company_id} 
                  onValueChange={handleCompanyChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a company..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.company_name} ({company.max_employees} employees)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCompany && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Selected Company</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><span className="font-medium">Name:</span> {selectedCompany.company_name}</p>
                    <p><span className="font-medium">Employees:</span> {selectedCompany.max_employees}</p>
                    <p><span className="font-medium">Primary Color:</span> 
                      <span 
                        className="inline-block w-4 h-4 rounded ml-2 border" 
                        style={{ backgroundColor: selectedCompany.primary_color }}
                      ></span>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proposal Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="investment">Investment Analysis</Label>
                    <p className="text-sm text-muted-foreground">
                      Financial modeling and ROI calculations
                    </p>
                  </div>
                </div>
                <Switch
                  id="investment"
                  checked={proposalData.include_investment_analysis}
                  onCheckedChange={(checked) => 
                    setProposalData(prev => ({ ...prev, include_investment_analysis: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="risk">HR Risk Assessment</Label>
                    <p className="text-sm text-muted-foreground">
                      Compliance risks and recommendations
                    </p>
                  </div>
                </div>
                <Switch
                  id="risk"
                  checked={proposalData.include_risk_assessment}
                  onCheckedChange={(checked) => 
                    setProposalData(prev => ({ ...prev, include_risk_assessment: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="recommendations">Service Recommendations</Label>
                    <p className="text-sm text-muted-foreground">
                      Tailored Easeworks service solutions
                    </p>
                  </div>
                </div>
                <Switch
                  id="recommendations"
                  checked={proposalData.include_recommendations}
                  onCheckedChange={(checked) => 
                    setProposalData(prev => ({ ...prev, include_recommendations: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
          {selectedAssessment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Risk Assessment Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Risk Score</span>
                  <Badge variant={selectedAssessment.risk_level === 'high' ? 'destructive' : 'secondary'}>
                    {selectedAssessment.risk_score}/100
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Risk Level</span>
                  <Badge variant={selectedAssessment.risk_level === 'high' ? 'destructive' : 'default'}>
                    {selectedAssessment.risk_level}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={() => handleSave('draft')} 
                disabled={saving}
                className="w-full"
                variant="outline"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button 
                onClick={() => handleSave('sent')} 
                disabled={saving}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Proposal
              </Button>
            </CardContent>
          </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <InvestmentAnalysisCalculator
            companyData={selectedCompany}
            onResultsChange={setInvestmentResults}
          />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Content editing features will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <ProposalPreview
            proposalData={proposalData}
            company={selectedCompany}
            assessment={selectedAssessment}
            investmentResults={investmentResults}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}